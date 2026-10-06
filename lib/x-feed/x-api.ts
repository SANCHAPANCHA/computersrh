import type { XMedia, XPost } from "./types";

// Minimal X API v2 client (app-only bearer token). Reads are billed per post
// returned, so callers pass since_id to only pay for new posts.

const base = () => (process.env.X_API_BASE || "https://api.x.com").replace(/\/$/, "");

async function xGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) throw new Error("X_BEARER_TOKEN is not set");
  const res = await fetch(`${base()}${path}?${new URLSearchParams(params)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`X API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json() as Promise<T>;
}

export async function lookupUserId(username: string): Promise<string> {
  const r = await xGet<{ data?: { id: string } }>(`/2/users/by/username/${encodeURIComponent(username)}`, {});
  if (!r.data?.id) throw new Error(`X user @${username} not found`);
  return r.data.id;
}

interface UrlEntity {
  start: number;
  end: number;
  url: string;
  expanded_url?: string;
  media_key?: string;
}
interface RawTweet {
  id: string;
  text: string;
  created_at: string;
  note_tweet?: { text: string; entities?: { urls?: UrlEntity[] } };
  entities?: { urls?: UrlEntity[] };
  attachments?: { media_keys?: string[] };
  public_metrics?: { like_count?: number; retweet_count?: number; reply_count?: number };
}
interface RawMedia {
  media_key: string;
  type: XMedia["type"];
  url?: string;
  preview_image_url?: string;
  width?: number;
  height?: number;
  alt_text?: string;
}

const decode = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

/** Expand t.co links and drop trailing media links so the text reads like on X. */
export function cleanText(text: string, urls: UrlEntity[] = []): string {
  let out = text;
  for (const u of [...urls].sort((a, b) => b.url.length - a.url.length)) {
    const isMedia = Boolean(u.media_key) || /\/(photo|video)\/\d+$/.test(u.expanded_url ?? "");
    out = out.split(u.url).join(isMedia ? "" : (u.expanded_url ?? u.url));
  }
  return decode(out).trim();
}

export async function fetchUserPosts(userId: string, username: string, sinceId: string | null): Promise<{ posts: XPost[]; newestId: string | null }> {
  const params: Record<string, string> = {
    max_results: sinceId ? "20" : "10",
    exclude: "replies,retweets",
    "tweet.fields": "created_at,public_metrics,entities,attachments,note_tweet",
    expansions: "attachments.media_keys",
    "media.fields": "url,preview_image_url,type,width,height,alt_text",
  };
  if (sinceId) params.since_id = sinceId;
  const r = await xGet<{ data?: RawTweet[]; includes?: { media?: RawMedia[] }; meta?: { newest_id?: string } }>(`/2/users/${userId}/tweets`, params);
  const media = new Map((r.includes?.media ?? []).map((m) => [m.media_key, m]));
  const posts = (r.data ?? []).map<XPost>((t) => ({
    id: t.id,
    username,
    text: t.note_tweet ? cleanText(t.note_tweet.text, t.note_tweet.entities?.urls) : cleanText(t.text, t.entities?.urls),
    postedAt: t.created_at,
    media: (t.attachments?.media_keys ?? [])
      .map((k) => media.get(k))
      .filter((m): m is RawMedia => Boolean(m && (m.url || m.preview_image_url)))
      .map((m) => ({ type: m.type, url: (m.url || m.preview_image_url)!, width: m.width, height: m.height, alt: m.alt_text })),
    metrics: { likes: t.public_metrics?.like_count, reposts: t.public_metrics?.retweet_count, replies: t.public_metrics?.reply_count },
  }));
  return { posts, newestId: r.meta?.newest_id ?? null };
}
