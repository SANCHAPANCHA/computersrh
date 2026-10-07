/** Chat punishment ladder. Mirrors public.chat_apply_violation() in the database. */
export const MAX_STRIKES = 3;

export type Punishment = "mute_1h" | "mute_24h" | "permanent";

export function punishmentFor(violationCount: number): Punishment {
  return violationCount <= 1 ? "mute_1h" : violationCount === 2 ? "mute_24h" : "permanent";
}

const LABELS: Record<Punishment, string> = { mute_1h: "CHAT MUTED FOR 1 HOUR", mute_24h: "CHAT MUTED FOR 24 HOURS", permanent: "PERMANENT CHAT BAN" };

/** e.g. "MESSAGE CENSORED · CHAT MUTED FOR 1 HOUR (VIOLATION 1/3)". */
export function violationNotice(subject: "MESSAGE" | "TOPIC" | "REPLY", punishment: Punishment, violationCount: number): string {
  return `${subject} CENSORED · ${LABELS[punishment]} (VIOLATION ${Math.min(violationCount, MAX_STRIKES)}/${MAX_STRIKES})`;
}

/** "59:12" under an hour, "23:59:12" above. */
export function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const p = (n: number) => String(n).padStart(2, "0");
  const h = Math.floor(s / 3600);
  return h ? `${p(h)}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}` : `${p(Math.floor(s / 60))}:${p(s % 60)}`;
}
