"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { LAB_BOTS } from "@/data/economy";
import { canFinish, getComponent } from "@/lib/pc-engine";
import { todayUtc } from "@/lib/pc-engine/challenges";
import type { Levels } from "@/lib/pc-engine/levels";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/db";
import { CATEGORIES, type Selection } from "@/types/game";
import { resolveBattle, type BattleLine } from "./battle";
import { getGameConfig } from "./config";
import { evaluateRig, rigRow } from "./rig";
import { rollRoulette, type SpinReward } from "./roulette";
import { isBuyable, shopPrice } from "./shop";

/** Crypto-grade randomness for rolls the player can't predict or replay. */
const rng = () => randomInt(0, 2 ** 47) / 2 ** 47;

const ERRORS: Record<string, string> = {
  INSUFFICIENT_CREDITS: "Not enough credits.",
  ALREADY_CHECKED_IN: "Already checked in today. Come back tomorrow!",
  ALREADY_SPUN: "Today's free spin is used. Come back tomorrow!",
  NO_UPGRADE_AVAILABLE: "You need a duplicate copy to upgrade (or it's already max level).",
  BATTLE_COOLDOWN: "Your rig is cooling down. Try again in a few seconds.",
  PART_NOT_OWNED: "You don't own one of those parts.",
};

function friendly(message: string | undefined) {
  const key = Object.keys(ERRORS).find((k) => message?.includes(k));
  return key ? ERRORS[key] : (message ?? "Something went wrong.");
}

async function player() {
  const sb = await createSupabaseServer();
  const admin = getAdminSupabase();
  if (!sb || !admin) return { error: "The game server isn't configured yet (SUPABASE_SERVICE_ROLE_KEY missing)." } as const;
  const { data } = await sb.auth.getUser();
  if (!data.user) return { error: "Log in to play." } as const;
  return { userId: data.user.id, admin, error: null } as const;
}

async function ownedLevels(admin: NonNullable<ReturnType<typeof getAdminSupabase>>, userId: string): Promise<Levels> {
  const { data } = await admin.from("inventory").select("component_id, level").eq("user_id", userId);
  return Object.fromEntries((data ?? []).map((r) => [r.component_id, r.level]));
}

function revalidateGame() {
  for (const p of ["/dashboard", "/pc", "/inventory", "/shop", "/daily", "/battles"]) revalidatePath(p);
}

// ───────────────────────── DAILY ─────────────────────────

export async function checkIn(): Promise<ActionResult<{ streak: number; reward: number; balance: number }>> {
  const p = await player();
  if (p.error) return { ok: false, error: p.error };
  const cfg = await getGameConfig();
  const { data, error } = await p.admin.rpc("game_checkin", { p_user: p.userId, p_day: todayUtc(), p_rewards: cfg.checkinRewards });
  if (error) return { ok: false, error: friendly(error.message) };
  revalidateGame();
  return { ok: true, streak: data.streak, reward: data.reward, balance: Number(data.balance) };
}

export async function spinRoulette(): Promise<ActionResult<{ reward: SpinReward; duplicate: boolean; level: number; spare: number }>> {
  const p = await player();
  if (p.error) return { ok: false, error: p.error };
  const cfg = await getGameConfig();
  const reward = rollRoulette(cfg, rng);
  const { data, error } = await p.admin.rpc("game_spin", { p_user: p.userId, p_day: todayUtc(), p_reward: reward });
  if (error) return { ok: false, error: friendly(error.message) };
  revalidateGame();
  return { ok: true, reward, duplicate: Boolean(data?.duplicate), level: data?.level ?? 1, spare: data?.spare ?? 0 };
}

// ───────────────────────── SHOP & INVENTORY ─────────────────────────

export async function buyComponent(componentId: string): Promise<ActionResult<{ duplicate: boolean; level: number; spare: number; balance: number }>> {
  const p = await player();
  if (p.error) return { ok: false, error: p.error };
  const cfg = await getGameConfig();
  const c = getComponent(componentId);
  if (!c) return { ok: false, error: "Unknown part." };
  if (!isBuyable(c, cfg)) return { ok: false, error: `${c.rarity} parts can only be won in the Daily Roulette.` };
  const { data, error } = await p.admin.rpc("game_buy", { p_user: p.userId, p_component: c.id, p_price: shopPrice(c, cfg) });
  if (error) return { ok: false, error: friendly(error.message) };
  revalidateGame();
  return { ok: true, duplicate: data.duplicate, level: data.level, spare: data.spare, balance: Number(data.balance) };
}

async function recomputeRig(admin: NonNullable<ReturnType<typeof getAdminSupabase>>, userId: string) {
  const { data: rig } = await admin.from("rigs").select("parts").eq("user_id", userId).maybeSingle();
  if (!rig) return null;
  const cfg = await getGameConfig();
  const levels = await ownedLevels(admin, userId);
  const selection = rig.parts as Selection;
  const ev = evaluateRig(selection, levels, cfg);
  await admin.rpc("game_save_rig", { p_user: userId, p_rig: rigRow(selection, levels, ev) });
  return ev;
}

export async function upgradeComponent(componentId: string): Promise<ActionResult<{ level: number; score: number | null }>> {
  const p = await player();
  if (p.error) return { ok: false, error: p.error };
  const cfg = await getGameConfig();
  if (!getComponent(componentId)) return { ok: false, error: "Unknown part." };
  const { data, error } = await p.admin.rpc("game_upgrade", { p_user: p.userId, p_component: componentId, p_max_level: cfg.upgrades.maxLevel });
  if (error) return { ok: false, error: friendly(error.message) };
  const ev = await recomputeRig(p.admin, p.userId);
  revalidateGame();
  return { ok: true, level: data as number, score: ev?.summary.score.total ?? null };
}

/**
 * Installs a full rig: buys any parts the player doesn't own yet, checks
 * compatibility (no Chaos Mode for real rigs) and saves the new score.
 */
export async function installRig(selection: Selection): Promise<ActionResult<{ spent: number; score: number; balance: number }>> {
  const p = await player();
  if (p.error) return { ok: false, error: p.error };
  const cfg = await getGameConfig();
  const clean: Selection = {};
  for (const cat of CATEGORIES) {
    const id = selection?.[cat];
    if (typeof id === "string" && getComponent(id)?.category === cat) clean[cat] = id;
  }
  const levels = await ownedLevels(p.admin, p.userId);
  const buy: { id: string; price: number }[] = [];
  for (const id of Object.values(clean) as string[]) {
    if (levels[id]) continue;
    const c = getComponent(id)!;
    if (!isBuyable(c, cfg)) return { ok: false, error: `${c.name} is ${c.rarity}: win it in the Daily Roulette first.` };
    buy.push({ id, price: shopPrice(c, cfg) });
  }
  const ev = evaluateRig(clean, levels, cfg);
  const check = canFinish(ev.summary.parts, ev.summary.conflicts, false);
  if (!check.ok) return { ok: false, error: check.reason ?? "Rig is incomplete." };
  const { data, error } = await p.admin.rpc("game_install", { p_user: p.userId, p_buy: buy, p_rig: rigRow(clean, levels, ev) });
  if (error) return { ok: false, error: friendly(error.message) };
  revalidateGame();
  return { ok: true, spent: buy.reduce((s, b) => s + b.price, 0), score: ev.summary.score.total, balance: Number(data) };
}

/** Swap one installed part for another owned part. */
export async function installPart(componentId: string): Promise<ActionResult<{ score: number }>> {
  const p = await player();
  if (p.error) return { ok: false, error: p.error };
  const c = getComponent(componentId);
  if (!c) return { ok: false, error: "Unknown part." };
  const { data: rig } = await p.admin.from("rigs").select("parts").eq("user_id", p.userId).maybeSingle();
  if (!rig) return { ok: false, error: "Build your first PC before swapping parts." };
  const levels = await ownedLevels(p.admin, p.userId);
  if (!levels[c.id]) return { ok: false, error: ERRORS.PART_NOT_OWNED };
  const res = await installRig({ ...(rig.parts as Selection), [c.category]: c.id });
  return res.ok ? { ok: true, score: res.score } : res;
}

// ───────────────────────── BATTLES ─────────────────────────

export interface BattleResult {
  won: boolean;
  lines: BattleLine[];
  myTotal: number;
  oppTotal: number;
  myScore: number;
  oppScore: number;
  opponent: { name: string; avatar: string; username: string | null; bot: boolean; selection: Selection; levels: Levels };
  credits: number;
  points: number;
  streak: number;
  streakBonus: number;
  rewarded: boolean;
}

export async function startBattle(): Promise<ActionResult<{ battle: BattleResult }>> {
  const p = await player();
  if (p.error) return { ok: false, error: p.error };
  const cfg = await getGameConfig();
  const { data: myRig } = await p.admin.from("rigs").select("parts").eq("user_id", p.userId).maybeSingle();
  if (!myRig) return { ok: false, error: "Build your PC before entering the arena." };
  const levels = await ownedLevels(p.admin, p.userId);
  const mySel = myRig.parts as Selection;
  const me = evaluateRig(mySel, levels, cfg);
  if (!me.summary.complete) return { ok: false, error: "Your rig is missing parts." };
  const myScore = me.summary.score.total;

  // Matchmaking: widen the score window until a rival player turns up.
  type Opp = BattleResult["opponent"] & { id: string | null; botId: string | null };
  let opp: Opp | null = null;
  for (const w of cfg.battle.windows) {
    const { data } = await p.admin
      .from("rigs")
      .select("user_id, parts, levels, score, profile:profiles!rigs_user_id_fkey(username, avatar)")
      .neq("user_id", p.userId)
      .gte("score", myScore - w)
      .lte("score", myScore + w)
      .limit(40);
    const pool = (data ?? []).filter((r) => Object.keys(r.parts ?? {}).length === CATEGORIES.length);
    if (pool.length) {
      const r = pool[Math.floor(rng() * pool.length)];
      const prof = (Array.isArray(r.profile) ? r.profile[0] : r.profile) as { username: string; avatar: string } | null;
      opp = { id: r.user_id, botId: null, bot: false, name: `@${prof?.username ?? "player"}`, username: prof?.username ?? null, avatar: prof?.avatar ?? "bot", selection: r.parts as Selection, levels: (r.levels ?? {}) as Levels };
      break;
    }
  }
  if (!opp) {
    // Nobody in range: fight the lab bot closest to your score.
    const bots = LAB_BOTS.map((b) => {
      const lv: Levels = Object.fromEntries(Object.values(b.selection).map((id) => [id!, b.levels ?? 1]));
      return { b, lv, score: evaluateRig(b.selection, lv, cfg).summary.score.total };
    }).sort((x, y) => Math.abs(x.score - myScore) - Math.abs(y.score - myScore));
    const pick = bots[rng() < 0.7 || bots.length < 2 ? 0 : 1];
    opp = { id: null, botId: pick.b.id, bot: true, name: pick.b.name, username: null, avatar: pick.b.avatar, selection: pick.b.selection, levels: pick.lv };
  }

  const them = evaluateRig(opp.selection, opp.levels, cfg);
  const out = resolveBattle(me.stats, them.stats, cfg.battle, rng);
  const row = {
    opponent_id: opp.id ?? "",
    opponent_bot: opp.botId,
    opponent_name: opp.name,
    opponent_avatar: opp.avatar,
    my_score: myScore,
    opp_score: them.summary.score.total,
    my_total: out.myTotal,
    opp_total: out.oppTotal,
    breakdown: out.lines,
    won: out.won,
    my_rig: { parts: mySel, levels },
    opp_rig: { parts: opp.selection, levels: opp.levels },
  };
  const { data, error } = await p.admin.rpc("game_record_battle", { p_user: p.userId, p_day: todayUtc(), p_battle: row, p_cfg: cfg.battle });
  if (error) return { ok: false, error: friendly(error.message) };
  revalidateGame();
  return {
    ok: true,
    battle: {
      won: out.won,
      lines: out.lines,
      myTotal: out.myTotal,
      oppTotal: out.oppTotal,
      myScore,
      oppScore: them.summary.score.total,
      opponent: { name: opp.name, avatar: opp.avatar, username: opp.username, bot: opp.bot, selection: opp.selection, levels: opp.levels },
      credits: data.credits,
      points: data.points,
      streak: data.streak,
      streakBonus: data.streakBonus,
      rewarded: data.rewarded,
    },
  };
}

