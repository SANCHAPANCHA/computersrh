import { CHAT_COLUMNS, toChatMessage, type ChatRow } from "@/components/chat/chat-utils";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { ChatMessage, ChatSanction } from "@/types/forum";

/** Latest chat messages, oldest first. */
export async function listChatMessages(limit = 50): Promise<ChatMessage[]> {
  const sb = await createSupabaseServer();
  if (!sb) return [];
  const { data, error } = await sb.from("chat_messages").select(CHAT_COLUMNS).order("created_at", { ascending: false }).limit(limit);
  if (error) console.error("listChatMessages", error.message);
  return ((data ?? []) as ChatRow[]).map(toChatMessage).reverse();
}

/** The signed-in user's own chat standing (RLS only exposes their own row). */
export async function getChatSanction(userId: string): Promise<ChatSanction | null> {
  const sb = await createSupabaseServer();
  if (!sb) return null;
  const { data } = await sb.from("chat_sanctions").select("violation_count, muted_until, permanently_banned").eq("user_id", userId).maybeSingle();
  return data ? { violationCount: data.violation_count, mutedUntil: data.muted_until, permanent: data.permanently_banned } : null;
}
