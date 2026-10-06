import { RARITIES, type Rarity } from "@/types/game";

export const RARITY_COLORS: Record<Rarity, string> = {
  COMMON: "#A9B1CC",
  UNCOMMON: "#3CE6B0",
  RARE: "#5EB0FF",
  EPIC: "#B48CFF",
  LEGENDARY: "#FFC95C",
  MYTHIC: "#FF7EB6",
};

export const rarityRank = (r: Rarity) => RARITIES.indexOf(r);

/** Score thresholds for the overall rig rarity (highest first). */
const RIG_THRESHOLDS: [number, Rarity][] = [
  [96, "MYTHIC"],
  [88, "LEGENDARY"],
  [76, "EPIC"],
  [62, "RARE"],
  [45, "UNCOMMON"],
  [0, "COMMON"],
];

export function rigRarity(score: number): Rarity {
  return RIG_THRESHOLDS.find(([min]) => score >= min)![1];
}

export function isRarity(v: unknown): v is Rarity {
  return typeof v === "string" && (RARITIES as readonly string[]).includes(v);
}
