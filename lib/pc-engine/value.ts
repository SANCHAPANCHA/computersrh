import type { BuildParts } from "@/types/game";

/** Fictional in-game value — sum of LAB prices. Not real market pricing. */
export function buildValue(parts: BuildParts): number {
  return Object.values(parts).reduce((sum, c) => sum + (c?.price ?? 0), 0);
}

export const formatValue = (n: number) => `$${n.toLocaleString("en-US")}`;
