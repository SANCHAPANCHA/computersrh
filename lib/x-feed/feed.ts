import { getAdminSupabase } from "@/lib/supabase/admin";
import type { XFeedResponse, XPost } from "./types";
import { fetchUserPosts, lookupUserId } from "./x-api";

export const X_USERNAME = process.env.X_FEED_USERNAME || "ComputersRh";
/** Minimum seconds between X API polls, shared across all server instances. */
const POLL_SECONDS = Math.max(15, Number(process.env.X_FEED_POLL_SECONDS) || 60);
const LIMIT = 12;

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

async function syncWithDatabase(): Promise<XFeedResponse> {
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
  const { data } = await db.from("x_posts").select("id, username, text, posted_at, media, metrics").eq("username", X_USERNAME.toLowerCase()).order("posted_at", { ascending: false }).limit(LIMIT);
  const posts = ((data ?? []) as Row[]).map(fromRow).map((p) => ({ ...p, username: X_USERNAME }));
  return { mode: "api", username: X_USERNAME, posts, updatedAt: new Date().toISOString(), stale };
}

async function syncInMemory(): Promise<XFeedResponse> {
  let stale = false;
  if (Date.now() - memory.checkedAt > POLL_SECONDS * 1000) {
    memory.checkedAt = Date.now();
    try {
      memory.userId ??= await lookupUserId(X_USERNAME);
      const { posts, newestId } = await fetchUserPosts(memory.userId, X_USERNAME, memory.sinceId);
      const seen = new Set(posts.map((p) => p.id));
      memory.posts = [...posts, ...memory.posts.filter((p) => !seen.has(p.id))].sort(byNewest).slice(0, LIMIT);
      if (newestId) memory.sinceId = newestId;
    } catch (e) {
      stale = true;
      console.error("x-feed sync", e instanceof Error ? e.message : e);
    }
  }
  return { mode: "api", username: X_USERNAME, posts: memory.posts, updatedAt: new Date().toISOString(), stale };
}

/** Latest posts from the project's X account, polling X at most every POLL_SECONDS. */
export async function getXFeed(): Promise<XFeedResponse> {
  if (!process.env.X_BEARER_TOKEN) return { mode: "embed", username: X_USERNAME, posts: [], updatedAt: new Date().toISOString() };
  inflight ??= (getAdminSupabase() ? syncWithDatabase() : syncInMemory()).finally(() => (inflight = null));
  return inflight;
}

/** Look up a mirrored post by id (for community topics that link to an X post). */
export async function getStoredXPost(id: string): Promise<XPost | null> {
  const db = getAdminSupabase();
  if (!db) return memory.posts.find((p) => p.id === id) ?? null;
  const { data } = await db.from("x_posts").select("id, username, text, posted_at, media, metrics").eq("id", id).maybeSingle();
  return data ? { ...fromRow(data as Row), username: X_USERNAME } : null;
}
