"use server";

import { moderate } from "@/lib/moderation/censor";
import { loadSanction, recordViolation } from "@/lib/moderation/enforce";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import { CHAT_COLUMNS, muteRemaining, toChatMessage, type ChatRow } from "@/components/chat/chat-utils";
import { CHAT_MAX_LENGTH, type ChatSendResult } from "@/types/forum";

const RATE_LIMIT_MS = 2000;
const CONTROL = /[\u0000-\u001f\u007f]+/g;

/** Posts a chat message. The only write path to chat_messages: filter, mute check and rate limit all live here. */
export async function sendChatMessage(input: string): Promise<ChatSendResult> {
  const sb = await createSupabaseServer();
  const db = getAdminSupabase();
  if (!sb || !db) return { ok: false, error: "Chat is offline: Supabase is not configured." };
  const { data: auth } = await sb.auth.getUser();
  const user = auth.user;
  if (!user) return { ok: false, error: "Log in to chat." };

  const text = String(input ?? "").replace(CONTROL, " ").replace(/\s+/g, " ").trim();
  if (!text) return { ok: false, error: "Write something first." };
  if (text.length > CHAT_MAX_LENGTH) return { ok: false, error: `Messages are limited to ${CHAT_MAX_LENGTH} characters.` };

  const sanction = await loadSanction(db, user.id);
  if (muteRemaining(sanction) > 0) return { ok: false, error: sanction.permanent ? "You are permanently banned from chat." : "You are muted in chat.", sanction };

  const { data: last } = await db.from("chat_messages").select("created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (last && Date.now() - new Date(last.created_at).getTime() < RATE_LIMIT_MS) return { ok: false, error: "Slow down: one message every 2 seconds." };

  const { data: profile } = await db.from("profiles").select("username, avatar").eq("id", user.id).maybeSingle();
  if (!profile) return { ok: false, error: "Finish setting up your profile to chat." };

  const verdict = moderate(text);
  const { data, error } = await db
    .from("chat_messages")
    .insert({ user_id: user.id, username: profile.username, avatar: profile.avatar, body: verdict.clean, was_censored: verdict.flagged })
    .select(CHAT_COLUMNS)
    .single();
  if (error || !data) {
    if (error?.message.includes("CHAT_MUTED")) return { ok: false, error: "You are muted in chat.", sanction: await loadSanction(db, user.id) };
    return { ok: false, error: error?.message.startsWith("Slow down") ? error.message : "Could not send your message." };
  }
  const message = toChatMessage(data as ChatRow);
  if (!verdict.flagged) return { ok: true, message };

  const outcome = await recordViolation(db, { userId: user.id, source: "chat", sourceId: message.id, messageId: message.id, matches: verdict.matches, censoredText: verdict.clean }, "MESSAGE");
  return { ok: true, message, notice: outcome?.notice ?? "MESSAGE CENSORED", sanction: outcome?.sanction };
}
