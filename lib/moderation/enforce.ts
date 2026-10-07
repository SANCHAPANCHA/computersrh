import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatSanction } from "@/types/forum";
import { violationNotice, type Punishment } from "./sanctions";

interface SanctionRow {
  violation_count: number;
  muted_until: string | null;
  permanently_banned: boolean;
}

const toSanction = (r: SanctionRow): ChatSanction => ({ violationCount: r.violation_count, mutedUntil: r.muted_until, permanent: r.permanently_banned });

/** Current sanction row for a user (service-role client). */
export async function loadSanction(db: SupabaseClient, userId: string): Promise<ChatSanction> {
  const { data } = await db.from("chat_sanctions").select("violation_count, muted_until, permanently_banned").eq("user_id", userId).maybeSingle();
  return data ? toSanction(data as SanctionRow) : { violationCount: 0, mutedUntil: null, permanent: false };
}

interface ViolationInput {
  userId: string;
  source: "chat" | "forum_thread" | "forum_reply";
  sourceId: string | null;
  messageId?: string | null;
  matches: string[];
  censoredText: string;
}

/** Records a violation and escalates the user's chat punishment atomically (database function). */
export async function recordViolation(db: SupabaseClient, v: ViolationInput, subject: "MESSAGE" | "TOPIC" | "REPLY") {
  const { data, error } = await db.rpc("chat_apply_violation", {
    p_user: v.userId,
    p_source: v.source,
    p_source_id: v.sourceId,
    p_message_id: v.messageId ?? null,
    p_reason: v.matches.join(", "),
    p_censored: v.censoredText,
  });
  const row = Array.isArray(data) ? data[0] : null;
  if (error || !row) {
    console.error("recordViolation", error?.message);
    return null;
  }
  const r = row as SanctionRow & { punishment: Punishment };
  return { sanction: toSanction(r), notice: violationNotice(subject, r.punishment, r.violation_count) };
}
