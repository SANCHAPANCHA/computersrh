import type { GameConfig, RouletteSlot } from "@/data/economy";
import { COMPONENTS } from "@/data/components";
import type { Rarity } from "@/types/game";

export type SpinReward =
  | { type: "credits"; amount: number }
  | { type: "component"; rarity: Rarity; componentId: string };

export type Rng = () => number;

export function pickSlot(slots: RouletteSlot[], rng: Rng): RouletteSlot {
  const total = slots.reduce((s, x) => s + Math.max(0, x.weight), 0);
  let roll = rng() * total;
  for (const s of slots) {
    roll -= Math.max(0, s.weight);
    if (roll < 0) return s;
  }
  return slots[slots.length - 1];
}

/** Server-side roll: weighted slot, then a uniformly random part of that rarity. */
export function rollRoulette(cfg: GameConfig, rng: Rng): SpinReward {
  const slot = pickSlot(cfg.roulette, rng);
  if (slot.reward.type === "credits") return { type: "credits", amount: slot.reward.amount };
  const rarity = slot.reward.rarity;
  const pool = COMPONENTS.filter((c) => c.rarity === rarity);
  const c = pool[Math.floor(rng() * pool.length)] ?? COMPONENTS[0];
  return { type: "component", rarity: c.rarity, componentId: c.id };
}

/** Odds table (percent) for display. */
export function rouletteOdds(cfg: GameConfig) {
  const total = cfg.roulette.reduce((s, x) => s + Math.max(0, x.weight), 0) || 1;
  return cfg.roulette.map((s) => ({ ...s, pct: (Math.max(0, s.weight) / total) * 100 }));
}
