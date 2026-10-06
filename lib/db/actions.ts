"use server";

import { revalidatePath } from "next/cache";
import { ACHIEVEMENTS } from "@/data/achievements";
import { checkChallenge, evaluateSelection, hasErrors, sanitizeBuildName, todayUtc } from "@/lib/pc-engine";
import { parseRgb } from "@/lib/pc-engine/encode";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { ChallengeRules } from "@/types/content";
import type { ActionResult } from "@/types/db";
import { CATEGORIES, type Category, type Selection } from "@/types/game";
import { AVATARS } from "@/data/avatars";
import { getComponent } from "@/lib/pc-engine/catalog";
import { USERNAME_RE, UUID_RE } from "./mappers";

const OFFLINE = "Accounts are offline: Supabase is not configured.";

async function requireUser() {
  const sb = await createSupabaseServer();
  if (!sb) return { sb: null, user: null, error: OFFLINE } as const;
  const { data } = await sb.auth.getUser();
  if (!data.user) return { sb, user: null, error: "Please log in first." } as const;
  return { sb, user: data.user, error: null } as const;
}

export interface SaveBuildInput {
  name: string;
  selection: Selection;
  rgb: string;
  chaos: boolean;
  buildTimeSeconds: number | null;
  isPublic: boolean;
}

/** Validates and scores the build on the server, then persists it. */
export async function saveBuild(input: SaveBuildInput): Promise<ActionResult<{ id: string; unlocked: string[] }>> {
  const { sb, user, error } = await requireUser();
  if (!sb || !user) return { ok: false, error: error! };

  const selection: Selection = {};
  for (const cat of CATEGORIES) {
    const id = input.selection?.[cat];
    if (typeof id === "string" && getComponent(id)?.category === cat) selection[cat] = id;
  }
  const summary = evaluateSelection(selection);
  if (!summary.complete) return { ok: false, error: "This build is missing parts." };
  if (hasErrors(summary.conflicts) && !input.chaos) return { ok: false, error: "This build has hardware conflicts. Enable Chaos Mode to keep it." };

  const { data: before } = await sb.from("user_achievements").select("achievement_id").eq("user_id", user.id);
  const time = typeof input.buildTimeSeconds === "number" && input.buildTimeSeconds >= 0 ? Math.min(Math.round(input.buildTimeSeconds), 86_400) : null;

  const { data: build, error: insErr } = await sb
    .from("builds")
    .insert({
      user_id: user.id,
      name: sanitizeBuildName(input.name),
      score: summary.score.total,
      rarity: summary.rarity,
      value: summary.value,
      power: summary.power.draw,
      rgb: parseRgb(input.rgb),
      chaos_mode: Boolean(input.chaos),
      build_time_seconds: time,
      is_public: input.isPublic !== false,
    })
    .select("id")
    .single();
  if (insErr || !build) return { ok: false, error: insErr?.message ?? "Could not save build." };

  const rows = (Object.entries(selection) as [Category, string][]).map(([category, component_id]) => ({ build_id: build.id, category, component_id }));
  const { error: partsErr } = await sb.from("build_components").insert(rows);
  if (partsErr) {
    await sb.from("builds").delete().eq("id", build.id);
    return { ok: false, error: `Could not save parts: ${partsErr.message}` };
  }

  const { data: after } = await sb.from("user_achievements").select("achievement_id").eq("user_id", user.id);
  const had = new Set((before ?? []).map((r) => r.achievement_id));
  const unlocked = (after ?? []).map((r) => r.achievement_id).filter((id) => !had.has(id)).map((id) => ACHIEVEMENTS.find((a) => a.id === id)?.name ?? id);

  revalidatePath("/explore");
  revalidatePath("/dashboard");
  return { ok: true, id: build.id, unlocked };
}

export async function toggleLike(buildId: string): Promise<ActionResult<{ liked: boolean; likes: number }>> {
  if (!UUID_RE.test(buildId)) return { ok: false, error: "Unknown build." };
  const { sb, user, error } = await requireUser();
  if (!sb || !user) return { ok: false, error: error! };

  const { data: existing } = await sb.from("likes").select("build_id").eq("build_id", buildId).eq("user_id", user.id).maybeSingle();
  if (existing) {
    const { error: e } = await sb.from("likes").delete().eq("build_id", buildId).eq("user_id", user.id);
    if (e) return { ok: false, error: e.message };
  } else {
    const { error: e } = await sb.from("likes").insert({ build_id: buildId, user_id: user.id });
    // 23505 = already liked (double click race) — treat as liked.
    if (e && e.code !== "23505") return { ok: false, error: e.message };
  }
  const { data: b } = await sb.from("builds").select("likes_count").eq("id", buildId).maybeSingle();
  revalidatePath(`/build/${buildId}`);
  return { ok: true, liked: !existing, likes: b?.likes_count ?? 0 };
}

export async function updateBuild(id: string, patch: { name?: string; isPublic?: boolean }): Promise<ActionResult> {
  if (!UUID_RE.test(id)) return { ok: false, error: "Unknown build." };
  const { sb, user, error } = await requireUser();
  if (!sb || !user) return { ok: false, error: error! };
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = sanitizeBuildName(patch.name);
  if (patch.isPublic !== undefined) update.is_public = patch.isPublic;
  const { error: e } = await sb.from("builds").update(update).eq("id", id).eq("user_id", user.id);
  if (e) return { ok: false, error: e.message };
  revalidatePath(`/build/${id}`);
  return { ok: true };
}

export async function deleteBuild(id: string): Promise<ActionResult> {
  if (!UUID_RE.test(id)) return { ok: false, error: "Unknown build." };
  const { sb, user, error } = await requireUser();
  if (!sb || !user) return { ok: false, error: error! };
  const { error: e } = await sb.from("builds").delete().eq("id", id).eq("user_id", user.id);
  if (e) return { ok: false, error: e.message };
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateProfile(input: { username: string; avatar: string; bio: string; favoriteComponent: string | null }): Promise<ActionResult> {
  const { sb, user, error } = await requireUser();
  if (!sb || !user) return { ok: false, error: error! };
  const username = input.username.trim().toLowerCase();
  if (!USERNAME_RE.test(username)) return { ok: false, error: "Username must be 3–20 characters: a–z, 0–9 or _." };
  if (!AVATARS.some((a) => a.id === input.avatar)) return { ok: false, error: "Pick one of the avatar presets." };
  const bio = input.bio.replace(/\s+/g, " ").trim().slice(0, 160);
  const fav = input.favoriteComponent && getComponent(input.favoriteComponent) ? input.favoriteComponent : null;
  const { error: e } = await sb.from("profiles").update({ username, avatar: input.avatar, bio, favorite_component: fav }).eq("id", user.id);
  if (e) return { ok: false, error: e.code === "23505" ? "That username is already taken." : e.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteAccount(): Promise<ActionResult> {
  const { sb, user, error } = await requireUser();
  if (!sb || !user) return { ok: false, error: error! };
  const { error: e } = await sb.rpc("delete_my_account");
  if (e) return { ok: false, error: e.message };
  await sb.auth.signOut();
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const sb = await createSupabaseServer();
  await sb?.auth.signOut();
  revalidatePath("/", "layout");
}

export async function submitChallengeEntry(buildId: string): Promise<ActionResult> {
  if (!UUID_RE.test(buildId)) return { ok: false, error: "Unknown build." };
  const { sb, user, error } = await requireUser();
  if (!sb || !user) return { ok: false, error: error! };

  const today = todayUtc();
  const { data: challenge } = await sb.from("daily_challenges").select("id, rules").lte("start_date", today).gte("end_date", today).limit(1).maybeSingle();
  if (!challenge) return { ok: false, error: "No active challenge today." };

  const { data: build } = await sb.from("builds").select("id, user_id, is_public, build_components(component_id, category)").eq("id", buildId).maybeSingle();
  if (!build || build.user_id !== user.id) return { ok: false, error: "You can only enter your own builds." };
  if (!build.is_public) return { ok: false, error: "Make the build public before entering." };

  const sel: Selection = {};
  for (const bc of build.build_components ?? []) sel[bc.category as Category] = bc.component_id;
  const fails = checkChallenge(challenge.rules as ChallengeRules, evaluateSelection(sel));
  if (fails.length) return { ok: false, error: fails[0] };

  await sb.from("challenge_entries").delete().eq("challenge_id", challenge.id).eq("user_id", user.id);
  const { error: e } = await sb.from("challenge_entries").insert({ challenge_id: challenge.id, build_id: buildId, user_id: user.id });
  if (e) return { ok: false, error: e.message };
  revalidatePath("/challenges");
  return { ok: true };
}
