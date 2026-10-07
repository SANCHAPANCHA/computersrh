import type { GameConfig } from "@/data/economy";
import type { GameComponent } from "@/types/game";

export function isBuyable(c: GameComponent, cfg: GameConfig) {
  return !cfg.shop.unbuyable.includes(c.rarity);
}

export function shopPrice(c: GameComponent, cfg: GameConfig) {
  return Math.max(1, Math.round(c.price * cfg.shop.priceMultiplier));
}

export const formatCredits = (n: number) => `${Math.round(n).toLocaleString("en-US")} CR`;
