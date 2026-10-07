import type { ChatMessage, ChatSanction } from "@/types/forum";

export interface ChatRow {
  id: string;
  user_id: string;
  username: string;
  avatar: string;
  body: string;
  was_censored: boolean;
  created_at: string;
}

export const CHAT_COLUMNS = "id, user_id, username, avatar, body, was_censored, created_at";

export const toChatMessage = (r: ChatRow): ChatMessage => ({
  id: r.id,
  userId: r.user_id,
  username: r.username,
  avatar: r.avatar,
  body: r.body,
  censored: r.was_censored,
  createdAt: r.created_at,
});

/** Milliseconds of mute left (Infinity for a permanent ban, 0 when free to chat). */
export function muteRemaining(s: ChatSanction | null | undefined, now = Date.now()): number {
  if (!s) return 0;
  if (s.permanent) return Infinity;
  return s.mutedUntil ? Math.max(0, new Date(s.mutedUntil).getTime() - now) : 0;
}
