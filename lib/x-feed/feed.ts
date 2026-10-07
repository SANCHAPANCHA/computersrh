import { getAdminSupabase } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { XFeedResponse, XPost } from "./types";
import { fetchUserPosts, lookupUserId } from "./x-api";

export const X_USERNAME = process.env.X_FEED_USERNAME || "ComputersRh";
/** Minimum seconds between X API polls, shared across all server instances. */
const POLL_SECONDS = Math.max(15, Number(process.env.X_FEED_POLL_SECONDS) || 60);
export const FEED_DEFAULT_LIMIT = 12;
export const FEED_MAX_LIMIT = 30;

// Fallback store when Supabase admin access isn't configured (per server instance).
const memory: { userId: string | null; sinceId: string | null; checkedAt: number; posts: XPost[] } = { userId: null, sinceId: null, checkedAt: 0, posts: [] };
let inflight: Promise<XFeedResponse> | null = null;

interface Row {
  id: string;
  username: string;
  text: string;
  posted_at: string;
  media: XPost["media"];
  metrics: XPost["metrics"];
}
const fromRow = (r: Row): XPost => ({ id: r.id, username: r.username, text: r.text, postedAt: r.posted_at, media: r.media ?? [], metrics: r.metrics ?? {} });
const byNewest = (a: XPost, b: XPost) => (BigInt(b.id) > BigInt(a.id) ? 1 : BigInt(b.id) < BigInt(a.id) ? -1 : 0);

async function syncWithDatabase(limit: number): Promise<XFeedResponse> {
  const db = getAdminSupabase()!;
  let stale = false;
  const { data: claim, error: claimErr } = await db.rpc("claim_x_poll", { p_username: X_USERNAME, p_interval_seconds: POLL_SECONDS });
  if (claimErr) console.error("x-feed claim", claimErr.message);
  const won = Array.isArray(claim) && claim.length > 0;
  if (won) {
    try {
      const state = claim[0] as { user_id: string | null; since_id: string | null };
      const userId = state.user_id ?? (await lookupUserId(X_USERNAME));
      const { posts, newestId } = await fetchUserPosts(userId, X_USERNAME, state.since_id);
      if (posts.length) {
        const { error } = await db.from("x_posts").upsert(
          posts.map((p) => ({ id: p.id, username: X_USERNAME.toLowerCase(), text: p.text, posted_at: p.postedAt, media: p.media, metrics: p.metrics })),
        );
        if (error) throw new Error(error.message);
      }
      await db.from("x_feed_state").update({ user_id: userId, ...(newestId ? { since_id: newestId } : {}) }).eq("username", X_USERNAME.toLowerCase());
    } catch (e) {
      stale = true;
      console.error("x-feed sync", e instanceof Error ? e.message : e);
    }
  }
  const { data } = await db.from("x_posts").select("id, username, text, posted_at, media, metrics").eq("username", X_USERNAME.toLowerCase()).order("posted_at", { ascending: false }).limit(limit);
  const posts = ((data ?? []) as Row[]).map(fromRow).map((p) => ({ ...p, username: X_USERNAME }));
  return { mode: "api", username: X_USERNAME, posts, updatedAt: new Date().toISOString(), stale };
}

async function syncInMemory(limit: number): Promise<XFeedResponse> {
  let stale = false;
  if (Date.now() - memory.checkedAt > POLL_SECONDS * 1000) {
    memory.checkedAt = Date.now();
    try {
      memory.userId ??= await lookupUserId(X_USERNAME);
      const { posts, newestId } = await fetchUserPosts(memory.userId, X_USERNAME, memory.sinceId);
      const seen = new Set(posts.map((p) => p.id));
      memory.posts = [...posts, ...memory.posts.filter((p) => !seen.has(p.id))].sort(byNewest).slice(0, FEED_MAX_LIMIT);
      if (newestId) memory.sinceId = newestId;
    } catch (e) {
      stale = true;
      console.error("x-feed sync", e instanceof Error ? e.message : e);
    }
  }
  return { mode: "api", username: X_USERNAME, posts: memory.posts.slice(0, limit), updatedAt: new Date().toISOString(), stale };
}

/** News records stored in x_posts (added by hand or by an earlier API sync), read with the public anon policy. */
async function readStored(limit: number): Promise<XPost[]> {
  const sb = await createSupabaseServer();
  if (!sb) return [];
  const { data, error } = await sb.from("x_posts").select("id, username, text, posted_at, media, metrics").order("posted_at", { ascending: false }).limit(limit);
  if (error) console.error("x-feed db", error.message);
  return ((data ?? []) as Row[]).map(fromRow).map((p) => ({ ...p, username: X_USERNAME }));
}

/**
 * Latest posts of the project's X account.
 * - X_BEARER_TOKEN set: mirrors via the X API (polling at most every POLL_SECONDS).
 * - otherwise: stored x_posts rows ("db"), or X's embedded timeline when there are none ("embed").
 */
export async function getXFeed(limit = FEED_DEFAULT_LIMIT): Promise<XFeedResponse> {
  const n = Math.min(FEED_MAX_LIMIT, Math.max(1, Math.floor(limit) || FEED_DEFAULT_LIMIT));
  if (!process.env.X_BEARER_TOKEN) {
    const posts = await readStored(n);
    return { mode: posts.length ? "db" : "embed", username: X_USERNAME, posts, updatedAt: new Date().toISOString() };
  }
  // One shared sync at a time; the fetch size is the maximum so any limit can be served from it.
  inflight ??= (getAdminSupabase() ? syncWithDatabase(FEED_MAX_LIMIT) : syncInMemory(FEED_MAX_LIMIT)).finally(() => (inflight = null));
  const feed = await inflight;
  return { ...feed, posts: feed.posts.slice(0, n) };
}

/** Look up a mirrored post by id (for community topics that link to an X post). */
export async function getStoredXPost(id: string): Promise<XPost | null> {
  const db = getAdminSupabase() ?? (await createSupabaseServer());
  if (!db) return memory.posts.find((p) => p.id === id) ?? null;
  const { data } = await db.from("x_posts").select("id, username, text, posted_at, media, metrics").eq("id", id).maybeSingle();
  return data ? { ...fromRow(data as Row), username: X_USERNAME } : null;
}
