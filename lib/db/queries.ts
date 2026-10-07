import { cache } from "react";
import { challengeForDate, todayUtc } from "@/lib/pc-engine/challenges";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { ChallengeRules, DailyChallenge } from "@/types/content";
import type { BuildView, LeaderRow, PublicProfile, Viewer } from "@/types/db";
import { BUILD_SELECT, UUID_RE, toBuildView, type BuildRow } from "./mappers";

export type ExploreTab = "newest" | "top" | "liked" | "legendary";

/** Signed-in user + public profile, memoised per request. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const sb = await createSupabaseServer();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  if (!data.user) return null;
  const [{ data: p }, { data: w }] = await Promise.all([
    sb.from("profiles").select("id, username, avatar").eq("id", data.user.id).maybeSingle(),
    sb.from("wallets").select("credits").eq("user_id", data.user.id).maybeSingle(),
  ]);
  const credits = w ? Number(w.credits) : null;
  return p ? { id: p.id, username: p.username, avatar: p.avatar, credits } : { id: data.user.id, username: "builder", avatar: "bot", credits };
});

export async function getViewerEmail(): Promise<string | null> {
  const sb = await createSupabaseServer();
  const { data } = (await sb?.auth.getUser()) ?? { data: { user: null } };
  return data.user?.email ?? null;
}

export async function listBuilds(tab: ExploreTab = "newest", limit = 24): Promise<BuildView[]> {
  const sb = await createSupabaseServer();
  if (!sb) return [];
  let q = sb.from("builds").select(BUILD_SELECT).eq("is_public", true);
  if (tab === "top") q = q.order("score", { ascending: false });
  if (tab === "liked") q = q.order("likes_count", { ascending: false });
  if (tab === "legendary") q = q.in("rarity", ["LEGENDARY", "MYTHIC"]).order("score", { ascending: false });
  const { data, error } = await q.order("created_at", { ascending: false }).limit(limit);
  if (error) console.error("listBuilds", error.message);
  return ((data ?? []) as unknown as BuildRow[]).map(toBuildView);
}

export async function getBuild(id: string): Promise<BuildView | null> {
  if (!UUID_RE.test(id)) return null;
  const sb = await createSupabaseServer();
  if (!sb) return null;
  const { data } = await sb.from("builds").select(BUILD_SELECT).eq("id", id).maybeSingle();
  return data ? toBuildView(data as unknown as BuildRow) : null;
}

export async function getUserBuilds(userId: string, limit = 50): Promise<BuildView[]> {
  const sb = await createSupabaseServer();
  if (!sb) return [];
  const { data } = await sb.from("builds").select(BUILD_SELECT).eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
  return ((data ?? []) as unknown as BuildRow[]).map(toBuildView);
}

export async function getProfileByUsername(username: string): Promise<PublicProfile | null> {
  const sb = await createSupabaseServer();
  if (!sb) return null;
  const { data } = await sb.from("profiles").select("id, username, avatar, bio, favorite_component, created_at").ilike("username", username.replace(/[%_\\]/g, "\\$&")).maybeSingle();
  return data
    ? { id: data.id, username: data.username, avatar: data.avatar, bio: data.bio, favoriteComponent: data.favorite_component, createdAt: data.created_at }
    : null;
}

export type LeaderKind = "score" | "builds" | "likes";

export async function getLeaderboard(kind: LeaderKind, limit = 25): Promise<LeaderRow[]> {
  const sb = await createSupabaseServer();
  if (!sb) return [];
  const col = kind === "score" ? "best_score" : kind === "builds" ? "builds_count" : "total_likes";
  const { data, error } = await sb.from("leaderboard").select("*").order(col, { ascending: false }).order("best_score", { ascending: false }).limit(limit);
  if (error) console.error("leaderboard", error.message);
  return (data ?? []).map((r) => ({ id: r.id, username: r.username, avatar: r.avatar, buildsCount: r.builds_count, bestScore: r.best_score, totalLikes: r.total_likes }));
}

export async function getUnlockedAchievements(userId: string): Promise<Record<string, string>> {
  const sb = await createSupabaseServer();
  if (!sb) return {};
  const { data } = await sb.from("user_achievements").select("achievement_id, unlocked_at").eq("user_id", userId);
  return Object.fromEntries((data ?? []).map((r) => [r.achievement_id, r.unlocked_at]));
}

export async function hasLiked(buildId: string, userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  const sb = await createSupabaseServer();
  if (!sb) return false;
  const { data } = await sb.from("likes").select("build_id").eq("build_id", buildId).eq("user_id", userId).maybeSingle();
  return Boolean(data);
}

export async function getTodayChallenge(): Promise<DailyChallenge> {
  const today = todayUtc();
  const sb = await createSupabaseServer();
  if (sb) {
    const { data } = await sb.from("daily_challenges").select("*").lte("start_date", today).gte("end_date", today).order("start_date", { ascending: false }).limit(1).maybeSingle();
    if (data)
      return { id: data.id, title: data.title, description: data.description, rules: data.rules as ChallengeRules, startDate: data.start_date, endDate: data.end_date };
  }
  return challengeForDate(today);
}

export interface EntryView {
  id: string;
  userId: string;
  build: BuildView;
}

export async function getChallengeEntries(challengeId: string, limit = 20): Promise<EntryView[]> {
  const sb = await createSupabaseServer();
  if (!sb) return [];
  const { data, error } = await sb
    .from("challenge_entries")
    .select(`id, user_id, build:builds!inner(${BUILD_SELECT})`)
    .eq("challenge_id", challengeId)
    .limit(200);
  if (error) console.error("entries", error.message);
  return ((data ?? []) as unknown as { id: string; user_id: string; build: BuildRow | BuildRow[] }[])
    .map((e) => ({ id: e.id, userId: e.user_id, build: toBuildView(Array.isArray(e.build) ? e.build[0] : e.build) }))
    .sort((a, b) => b.build.score - a.build.score || a.build.value - b.build.value)
    .slice(0, limit);
}

export async function getMyEntry(challengeId: string, userId: string): Promise<EntryView | null> {
  const sb = await createSupabaseServer();
  if (!sb) return null;
  const { data } = await sb.from("challenge_entries").select(`id, user_id, build:builds(${BUILD_SELECT})`).eq("challenge_id", challengeId).eq("user_id", userId).maybeSingle();
  if (!data?.build) return null;
  const row = data as unknown as { id: string; user_id: string; build: BuildRow | BuildRow[] };
  return { id: row.id, userId: row.user_id, build: toBuildView(Array.isArray(row.build) ? row.build[0] : row.build) };
}
