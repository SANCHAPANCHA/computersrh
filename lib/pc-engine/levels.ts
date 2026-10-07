import type { GameConfig } from "@/data/economy";
import { CATEGORIES, type BuildParts, type Category, type GameComponent, type Selection } from "@/types/game";
import { getComponent } from "./catalog";

export type Levels = Record<string, number>;
type UpgradeCfg = GameConfig["upgrades"];

/**
 * A component's stats at a given upgrade level. Growth is data-driven per
 * category (see `upgrades` in data/economy.ts): performance follows a
 * diminishing bonus curve, power-hungry parts draw a bit more, PSUs gain
 * wattage, coolers gain TDP headroom and cases gain airflow.
 */
export function leveled<T extends GameComponent>(c: T, level: number, up: UpgradeCfg): T {
  const L = Math.max(1, Math.min(Math.floor(level || 1), up.maxLevel));
  if (L === 1) return c;
  const g = up.growth[c.category] ?? { perf: 0.5 };
  const step = L - 1;
  const bonus = Math.round((up.perfBonus[L - 1] ?? up.perfBonus[up.perfBonus.length - 1] ?? 0) * g.perf);
  const base = { ...c, performance: Math.min(125, c.performance + bonus), price: Math.round(c.price * (1 + 0.5 * step)) };
  if (g.power && c.power) base.power = Math.round(c.power * (1 + g.power * step));
  const m = { ...c.metadata } as Record<string, unknown>;
  if (c.category === "psu" && g.capacity) m.wattage = Math.round((c.metadata.wattage * (1 + g.capacity * step)) / 10) * 10;
  if (c.category === "cooling" && g.capacity) m.maxTdp = Math.round(c.metadata.maxTdp * (1 + g.capacity * step));
  if (c.category === "case" && g.airflow) m.airflow = Math.min(100, c.metadata.airflow + g.airflow * step);
  return { ...base, metadata: m } as T;
}

export function resolveLeveled(selection: Selection, levels: Levels, up: UpgradeCfg): BuildParts {
  const parts: BuildParts = {};
  for (const cat of CATEGORIES) {
    const c = getComponent(selection[cat]);
    if (c && c.category === cat) (parts as Record<Category, GameComponent>)[cat] = leveled(c, levels[c.id] ?? 1, up);
  }
  return parts;
}
