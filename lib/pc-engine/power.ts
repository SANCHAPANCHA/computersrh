import type { BuildParts } from "@/types/game";

export interface PowerInfo {
  draw: number;
  capacity: number;
  headroom: number;
  /** headroom / capacity, 0 when no PSU */
  headroomRatio: number;
}

/** Total watts pulled from the PSU. Monitors plug into the wall, so excluded. */
export function powerDraw(parts: BuildParts): number {
  let total = 0;
  for (const [cat, c] of Object.entries(parts)) {
    if (!c || cat === "monitor" || cat === "psu") continue;
    total += c.power;
  }
  return total;
}

export function powerInfo(parts: BuildParts): PowerInfo {
  const draw = powerDraw(parts);
  const capacity = parts.psu?.metadata.wattage ?? 0;
  const headroom = capacity - draw;
  return { draw, capacity, headroom, headroomRatio: capacity ? headroom / capacity : 0 };
}

/** Smallest PSU wattage that keeps 10% headroom. */
export function recommendedWattage(draw: number): number {
  return Math.ceil((draw * 1.1) / 50) * 50;
}
