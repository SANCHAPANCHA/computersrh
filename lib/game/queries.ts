import { cache } from "react";
import type { GameConfig } from "@/data/economy";
import { todayUtc } from "@/lib/pc-engine/challenges";
import type { Levels } from "@/lib/pc-engine/levels";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Selection } from "@/types/game";
import type { SpinReward } from "./roulette";

export interface InventoryItem {
  componentId: string;
  level: number;
  spare: number;
  acquiredAt: string;
}

export interface RigState {
  parts: Selection;
  levels: Levels;
  score: number;
  rarity: string;
  pcLevel: number;
  value: number;
  power: number;
  updatedAt: string;
}

export interface TxView {
  id: number;
  amount: number;
  balanceAfter: number;
  kind: string;
  ref: string | null;
  meta: Record<string, unknown>;
  createdAt: string;
}

export interface BattleRecord {
  id: string;
  attacker: boolean;
  opponentName: string;
  opponentAvatar: string;
  myScore: number;
  oppScore: number;
  myTotal: number;
  oppTotal: number;
  won: boolean;
  credits: number;
  points: number;
  streak: number;
  createdAt: string;
}

export interface PlayerState {
  credits: number;
  inventory: InventoryItem[];
  levels: Levels;
  rig: RigState | null;
  checkin: { doneToday: boolean; streak: number; todayReward: number | null; nextStreak: number; nextReward: number };
  spin: { doneToday: boolean; reward: SpinReward | null };
  battle: { wins: number; losses: number; streak: number; bestStreak: number; points: number; rewardedToday: number; lastBattleAt: string | null };
  transactions: TxView[];
  isNew: boolean;
}

export function checkinPreview(lastStreakYesterday: number | null, cfg: GameConfig) {
  const nextStreak = (lastStreakYesterday ?? 0) + 1;
  const r = cfg.checkinRewards;
  return { nextStreak, nextReward: r[(nextStreak - 1) % r.length] };
}

function yesterdayOf(day: string) {
  return new Date(Date.parse(`${day}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
}

/** Everything the signed-in player owns. Reads go through RLS (own rows only). */
export const getPlayerState = cache(async (userId: string, cfg: GameConfig): Promise<PlayerState | null> => {
  const sb = await createSupabaseServer();
  if (!sb) return null;
  const today = todayUtc();
  const [wallet, inv, rig, checks, spin, stats, txs] = await Promise.all([
    sb.from("wallets").select("credits").eq("user_id", userId).maybeSingle(),
    sb.from("inventory").select("component_id, level, spare, acquired_at").eq("user_id", userId).order("acquired_at", { ascending: true }),
    sb.from("rigs").select("parts, levels, score, rarity, pc_level, value, power, updated_at").eq("user_id", userId).maybeSingle(),
    sb.from("checkins").select("day, streak, reward").eq("user_id", userId).in("day", [today, yesterdayOf(today)]),
    sb.from("roulette_spins").select("reward").eq("user_id", userId).eq("day", today).maybeSingle(),
    sb.from("battle_stats").select("*").eq("user_id", userId).maybeSingle(),
    sb.from("credit_transactions").select("id, amount, balance_after, kind, ref, meta, created_at").eq("user_id", userId).order("id", { ascending: false }).limit(12),
  ]);

  const inventory: InventoryItem[] = (inv.data ?? []).map((r) => ({ componentId: r.component_id, level: r.level, spare: r.spare, acquiredAt: r.acquired_at }));
  const levels: Levels = Object.fromEntries(inventory.map((i) => [i.componentId, i.level]));
  const todayCheck = checks.data?.find((c) => c.day === today);
  const yCheck = checks.data?.find((c) => c.day !== today);
  const preview = checkinPreview(yCheck?.streak ?? null, cfg);
  const s = stats.data;

  return {
    credits: Number(wallet.data?.credits ?? 0),
    inventory,
    levels,
    rig: rig.data
      ? {
          parts: rig.data.parts as Selection,
          levels: rig.data.levels as Levels,
          score: rig.data.score,
          rarity: rig.data.rarity,
          pcLevel: rig.data.pc_level,
          value: rig.data.value,
          power: rig.data.power,
          updatedAt: rig.data.updated_at,
        }
      : null,
    checkin: todayCheck
      ? { doneToday: true, streak: todayCheck.streak, todayReward: todayCheck.reward, ...checkinPreview(todayCheck.streak, cfg) }
      : { doneToday: false, streak: yCheck?.streak ?? 0, todayReward: null, ...preview },
    spin: { doneToday: Boolean(spin.data), reward: (spin.data?.reward as SpinReward) ?? null },
    battle: {
      wins: s?.wins ?? 0,
      losses: s?.losses ?? 0,
      streak: s?.streak ?? 0,
      bestStreak: s?.best_streak ?? 0,
      points: s?.points ?? 0,
      rewardedToday: s?.rewarded_day === today ? s.rewarded_count : 0,
      lastBattleAt: s?.last_battle_at ?? null,
    },
    transactions: (txs.data ?? []).map((t) => ({ id: t.id, amount: Number(t.amount), balanceAfter: Number(t.balance_after), kind: t.kind, ref: t.ref, meta: t.meta ?? {}, createdAt: t.created_at })),
    isNew: !rig.data && inventory.length === 0,
  };
});

export async function getBattleHistory(userId: string, limit = 15): Promise<BattleRecord[]> {
  const sb = await createSupabaseServer();
  if (!sb) return [];
  const { data } = await sb
    .from("battles")
    .select("id, user_id, opponent_name, opponent_avatar, my_score, opp_score, my_total, opp_total, won, credits, points, streak, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((b) => ({
    id: b.id,
    attacker: b.user_id === userId,
    opponentName: b.opponent_name,
    opponentAvatar: b.opponent_avatar,
    myScore: b.my_score,
    oppScore: b.opp_score,
    myTotal: Number(b.my_total),
    oppTotal: Number(b.opp_total),
    won: b.won,
    credits: b.credits,
    points: b.points,
    streak: b.streak,
    createdAt: b.created_at,
  }));
}

export async function getPublicRig(userId: string): Promise<RigState | null> {
  const sb = await createSupabaseServer();
  if (!sb) return null;
  const { data } = await sb.from("rigs").select("parts, levels, score, rarity, pc_level, value, power, updated_at").eq("user_id", userId).maybeSingle();
  return data
    ? { parts: data.parts as Selection, levels: data.levels as Levels, score: data.score, rarity: data.rarity, pcLevel: data.pc_level, value: data.value, power: data.power, updatedAt: data.updated_at }
    : null;
}
