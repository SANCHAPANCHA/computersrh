"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { X_STATUS_RE } from "@/lib/x-feed/types";
import type { ActionResult } from "@/types/db";
import { FORUM_CATEGORIES, type ForumCategory } from "@/types/forum";
import { UUID_RE } from "./mappers";

const clean = (s: unknown, max: number) => String(s ?? "").replace(/\r\n/g, "\n").replace(/\n{4,}/g, "\n\n\n").trim().slice(0, max);

async function session() {
  const sb = await createSupabaseServer();
  if (!sb) return { sb: null, user: null, error: "Community is offline: Supabase is not configured." } as const;
  const { data } = await sb.auth.getUser();
  return data.user ? ({ sb, user: data.user, error: null } as const) : ({ sb, user: null, error: "Log in to join the conversation." } as const);
}

const friendly = (msg: string) => (msg.startsWith("Slow down") ? msg : msg.includes("check constraint") ? "That message doesn't fit the rules (length or link format)." : msg);

export async function createThread(input: { category: string; title: string; body: string; xUrl?: string; buildId?: string }): Promise<ActionResult<{ id: string }>> {
  const { sb, user, error } = await session();
  if (!sb || !user) return { ok: false, error: error! };
  const category = (FORUM_CATEGORIES as readonly string[]).includes(input.category) ? (input.category as ForumCategory) : null;
  const title = clean(input.title, 90).replace(/\s+/g, " ");
  const body = clean(input.body, 2000);
  const xUrl = clean(input.xUrl, 200).replace(/^https:\/\/twitter\.com/, "https://x.com").replace(/[?#].*$/, "") || null;
  const buildId = input.buildId && UUID_RE.test(input.buildId) ? input.buildId : null;
  if (!category) return { ok: false, error: "Pick a category." };
  if (title.length < 3) return { ok: false, error: "Title needs at least 3 characters." };
  if (!body) return { ok: false, error: "Write something first." };
  if (xUrl && !X_STATUS_RE.test(xUrl)) return { ok: false, error: "X link must look like https://x.com/user/status/123…" };

  const { data, error: e } = await sb.from("forum_threads").insert({ user_id: user.id, category, title, body, x_url: xUrl, build_id: buildId }).select("id").single();
  if (e || !data) return { ok: false, error: friendly(e?.message ?? "Could not post.") };
  revalidatePath("/community");
  return { ok: true, id: data.id };
}

export async function postReply(threadId: string, body: string): Promise<ActionResult> {
  if (!UUID_RE.test(threadId)) return { ok: false, error: "Unknown topic." };
  const { sb, user, error } = await session();
  if (!sb || !user) return { ok: false, error: error! };
  const text = clean(body, 2000);
  if (!text) return { ok: false, error: "Write something first." };
  const { error: e } = await sb.from("forum_replies").insert({ thread_id: threadId, user_id: user.id, body: text });
  if (e) return { ok: false, error: friendly(e.message) };
  revalidatePath(`/community/${threadId}`);
  return { ok: true };
}

export async function deleteThread(id: string): Promise<ActionResult> {
  if (!UUID_RE.test(id)) return { ok: false, error: "Unknown topic." };
  const { sb, user, error } = await session();
  if (!sb || !user) return { ok: false, error: error! };
  const { data, error: e } = await sb.from("forum_threads").delete().eq("id", id).eq("user_id", user.id).select("id");
  if (e || !data?.length) return { ok: false, error: e?.message ?? "You can only delete your own topics." };
  revalidatePath("/community");
  return { ok: true };
}

export async function deleteReply(id: string, threadId: string): Promise<ActionResult> {
  if (!UUID_RE.test(id)) return { ok: false, error: "Unknown message." };
  const { sb, user, error } = await session();
  if (!sb || !user) return { ok: false, error: error! };
  const { data, error: e } = await sb.from("forum_replies").delete().eq("id", id).eq("user_id", user.id).select("id");
  if (e || !data?.length) return { ok: false, error: e?.message ?? "You can only delete your own messages." };
  revalidatePath(`/community/${threadId}`);
  return { ok: true };
}
