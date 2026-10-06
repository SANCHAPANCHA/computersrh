import { createSupabaseServer } from "@/lib/supabase/server";
import { FORUM_CATEGORIES, type Author, type ForumCategory, type ReplyView, type ThreadView } from "@/types/forum";
import { UUID_RE } from "./mappers";

const THREAD_SELECT = "id, category, title, body, x_url, build_id, reply_count, last_activity_at, created_at, author:profiles!forum_threads_user_id_fkey(id, username, avatar)";

type One<T> = T | T[] | null;
const one = <T,>(v: One<T>): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);
const ghost: Author = { id: "", username: "deleted", avatar: "ghost" };

interface ThreadRow {
  id: string;
  category: string;
  title: string;
  body: string;
  x_url: string | null;
  build_id: string | null;
  reply_count: number;
  last_activity_at: string;
  created_at: string;
  author: One<Author>;
}

const toThread = (r: ThreadRow): ThreadView => ({
  id: r.id,
  category: (FORUM_CATEGORIES as readonly string[]).includes(r.category) ? (r.category as ForumCategory) : "offtopic",
  title: r.title,
  body: r.body,
  xUrl: r.x_url,
  buildId: r.build_id,
  replyCount: r.reply_count,
  lastActivityAt: r.last_activity_at,
  createdAt: r.created_at,
  author: one(r.author) ?? ghost,
});

export async function listThreads(category?: ForumCategory, limit = 40): Promise<ThreadView[]> {
  const sb = await createSupabaseServer();
  if (!sb) return [];
  let q = sb.from("forum_threads").select(THREAD_SELECT);
  if (category) q = q.eq("category", category);
  const { data, error } = await q.order("last_activity_at", { ascending: false }).limit(limit);
  if (error) console.error("listThreads", error.message);
  return ((data ?? []) as unknown as ThreadRow[]).map(toThread);
}

export async function getThread(id: string): Promise<{ thread: ThreadView; replies: ReplyView[] } | null> {
  if (!UUID_RE.test(id)) return null;
  const sb = await createSupabaseServer();
  if (!sb) return null;
  const [{ data: t }, { data: rs }] = await Promise.all([
    sb.from("forum_threads").select(THREAD_SELECT).eq("id", id).maybeSingle(),
    sb.from("forum_replies").select("id, body, created_at, author:profiles!forum_replies_user_id_fkey(id, username, avatar)").eq("thread_id", id).order("created_at", { ascending: true }).limit(500),
  ]);
  if (!t) return null;
  const replies = ((rs ?? []) as unknown as { id: string; body: string; created_at: string; author: One<Author> }[]).map((r) => ({
    id: r.id,
    body: r.body,
    createdAt: r.created_at,
    author: one(r.author) ?? ghost,
  }));
  return { thread: toThread(t as unknown as ThreadRow), replies };
}
