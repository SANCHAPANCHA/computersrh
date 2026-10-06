import type { BuildParts, Rarity, Selection } from "@/types/game";
import { resolveSelection } from "./catalog";
import { getConflicts, type Conflict } from "./compatibility";
import { powerInfo, type PowerInfo } from "./power";
import { rigRarity } from "./rarity";
import { scoreBuild, type ScoreBreakdown } from "./scoring";
import { isComplete } from "./validation";
import { buildValue } from "./value";

export interface BuildSummary {
  parts: BuildParts;
  conflicts: Conflict[];
  score: ScoreBreakdown;
  rarity: Rarity;
  value: number;
  power: PowerInfo;
  complete: boolean;
}

export function evaluateParts(parts: BuildParts): BuildSummary {
  const conflicts = getConflicts(parts);
  const score = scoreBuild(parts, conflicts);
  return {
    parts,
    conflicts,
    score,
    rarity: rigRarity(score.total),
    value: buildValue(parts),
    power: powerInfo(parts),
    complete: isComplete(parts),
  };
}

export const evaluateSelection = (selection: Selection) => evaluateParts(resolveSelection(selection));
