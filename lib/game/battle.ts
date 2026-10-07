import type { GameConfig } from "@/data/economy";
import type { BattleStats } from "./rig";
import type { Rng } from "./roulette";

export const BATTLE_STATS = ["compute", "graphics", "memory", "thermals", "power", "balance"] as const;
export type BattleStat = (typeof BATTLE_STATS)[number];
export const BATTLE_LABELS: Record<BattleStat, string> = { compute: "CPU", graphics: "GPU", memory: "MEMORY", thermals: "THERMALS", power: "POWER", balance: "BALANCE" };

export interface BattleLine {
  stat: BattleStat;
  mine: number;
  theirs: number;
  diff: number;
}

export interface BattleOutcome {
  lines: BattleLine[];
  myTotal: number;
  oppTotal: number;
  won: boolean;
}

/**
 * Each stat is rolled with a small random swing, then weighted. A stronger
 * rig usually wins, but a close match can go either way.
 */
export function resolveBattle(mine: BattleStats, theirs: BattleStats, cfg: GameConfig["battle"], rng: Rng): BattleOutcome {
  const swing = () => 1 + (rng() * 2 - 1) * cfg.variance;
  const lines: BattleLine[] = BATTLE_STATS.map((stat) => {
    const a = Math.max(0, mine[stat] ?? 0) * swing();
    const b = Math.max(0, theirs[stat] ?? 0) * swing();
    return { stat, mine: Math.round(a), theirs: Math.round(b), diff: Math.round(a - b) };
  });
  const total = (side: "mine" | "theirs") => lines.reduce((s, l) => s + l[side] * cfg.weights[l.stat], 0);
  const myTotal = Math.round(total("mine") * 10) / 10;
  const oppTotal = Math.round(total("theirs") * 10) / 10;
  const won = myTotal === oppTotal ? rng() < 0.5 : myTotal > oppTotal;
  return { lines, myTotal, oppTotal, won };
}
