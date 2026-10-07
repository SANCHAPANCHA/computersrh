import type { GameConfig } from "@/data/economy";
import { evaluateParts, type BuildSummary } from "@/lib/pc-engine/evaluate";
import { resolveLeveled, type Levels } from "@/lib/pc-engine/levels";
import { CATEGORIES, type Selection } from "@/types/game";

export interface BattleStats {
  compute: number;
  graphics: number;
  memory: number;
  thermals: number;
  power: number;
  balance: number;
}

export interface RigEval {
  summary: BuildSummary;
  pcLevel: number;
  pcLevelName: string;
  nextLevel: { level: number; name: string; minScore: number } | null;
  stats: BattleStats;
}

export function pcLevelFor(score: number, cfg: GameConfig) {
  const levels = [...cfg.pcLevels].sort((a, b) => a.minScore - b.minScore);
  let cur = levels[0];
  for (const l of levels) if (score >= l.minScore) cur = l;
  const next = levels.find((l) => l.minScore > score) ?? null;
  return { level: cur.level, name: cur.name, next };
}

export function evaluateRig(selection: Selection, levels: Levels, cfg: GameConfig): RigEval {
  const summary = evaluateParts(resolveLeveled(selection, levels, cfg.upgrades));
  const lvl = pcLevelFor(summary.score.total, cfg);
  const c = summary.score.categories;
  // Conflicts (only possible after an upgrade raises power draw) cost balance.
  const balance = Math.max(0, summary.score.balance - summary.score.penalty * 2);
  return {
    summary,
    pcLevel: lvl.level,
    pcLevelName: lvl.name,
    nextLevel: lvl.next,
    stats: { compute: c.compute, graphics: c.graphics, memory: c.memory, thermals: c.thermals, power: c.efficiency, balance },
  };
}

/** Row shape persisted in `rigs` (and snapshotted into battles). */
export function rigRow(selection: Selection, levels: Levels, ev: RigEval) {
  const parts: Record<string, string> = {};
  const lv: Record<string, number> = {};
  for (const cat of CATEGORIES) {
    const id = selection[cat];
    if (!id) continue;
    parts[cat] = id;
    lv[id] = levels[id] ?? 1;
  }
  return {
    parts,
    levels: lv,
    score: ev.summary.score.total,
    rarity: ev.summary.rarity,
    pc_level: ev.pcLevel,
    value: ev.summary.value,
    power: ev.summary.power.draw,
    stats: ev.stats,
  };
}
