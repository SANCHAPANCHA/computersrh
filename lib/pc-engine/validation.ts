import { CATEGORIES, type BuildParts, type Category } from "@/types/game";
import { hasErrors, type Conflict } from "./compatibility";

export function missingCategories(parts: BuildParts): Category[] {
  return CATEGORIES.filter((c) => !parts[c]);
}

export function isComplete(parts: BuildParts): boolean {
  return missingCategories(parts).length === 0;
}

export interface FinishCheck {
  ok: boolean;
  reason?: string;
}

/** Can this build be booted? Chaos Mode ignores hardware conflicts. */
export function canFinish(parts: BuildParts, conflicts: Conflict[], chaos: boolean): FinishCheck {
  const missing = missingCategories(parts);
  if (missing.length) return { ok: false, reason: `Missing: ${missing.map((m) => m.toUpperCase()).join(", ")}` };
  if (!chaos && hasErrors(conflicts)) return { ok: false, reason: "Resolve hardware conflicts first (or enable Chaos Mode)." };
  return { ok: true };
}

export const BUILD_NAME_MAX = 32;

export function sanitizeBuildName(name: string | null | undefined): string {
  const clean = (name ?? "").replace(/[^\p{L}\p{N} _\-.!?#'&]/gu, "").replace(/\s+/g, " ").trim().slice(0, BUILD_NAME_MAX);
  return clean || "MY FIRST RIG";
}
