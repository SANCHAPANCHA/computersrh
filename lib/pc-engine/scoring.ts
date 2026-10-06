import type { BuildParts, PsuEfficiency } from "@/types/game";
import type { Conflict } from "./compatibility";
import { powerInfo } from "./power";

export const SCORE_CATEGORIES = ["compute", "graphics", "memory", "storage", "thermals", "efficiency"] as const;
export type ScoreCategory = (typeof SCORE_CATEGORIES)[number];

export interface ScoreBreakdown {
  total: number;
  categories: Record<ScoreCategory, number>;
  balance: number;
  penalty: number;
}

const WEIGHTS: Record<ScoreCategory | "balance", number> = {
  compute: 0.22,
  graphics: 0.26,
  memory: 0.12,
  storage: 0.08,
  thermals: 0.12,
  efficiency: 0.1,
  balance: 0.1,
};

const EFFICIENCY_MULT: Record<PsuEfficiency, number> = { BRONZE: 0.85, GOLD: 0.93, PLATINUM: 0.97, TITANIUM: 1 };

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

function thermalsScore(parts: BuildParts): number {
  const { cpu, cooling, case: pcCase, gpu } = parts;
  if (!cooling) return 0;
  const cpuHeat = cpu?.power ?? 65;
  const margin = (cooling.metadata.maxTdp - cpuHeat) / cpuHeat;
  const coolerScore = clamp(70 + margin * 60, 10, 100);
  const airflow = pcCase?.metadata.airflow ?? 50;
  let score = coolerScore * 0.6 + airflow * 0.25 + cooling.performance * 0.15;
  if (gpu && gpu.power >= 350 && airflow < 60) score -= 10;
  return clamp(score);
}

function efficiencyScore(parts: BuildParts): number {
  if (!parts.psu) return 0;
  const { headroomRatio: h } = powerInfo(parts);
  let base: number;
  if (h < 0) base = 0;
  else if (h < 0.2) base = 40 + (h / 0.2) * 60;
  else if (h <= 0.45) base = 100;
  else base = clamp(100 - ((h - 0.45) / 0.35) * 30, 60, 100);
  return clamp(base * EFFICIENCY_MULT[parts.psu.metadata.efficiency]);
}

/**
 * Score a (possibly incomplete) build from 0–100. Missing parts count as 0 so
 * the live score climbs as the rig comes together.
 */
export function scoreBuild(parts: BuildParts, conflicts: Conflict[] = []): ScoreBreakdown {
  const throttle = parts.cooling && parts.cpu && parts.cooling.metadata.maxTdp < parts.cpu.power ? 0.85 : 1;
  const categories: Record<ScoreCategory, number> = {
    compute: Math.round((parts.cpu?.performance ?? 0) * (parts.cpu && !parts.cooling ? 0.7 : throttle)),
    graphics: parts.gpu?.performance ?? 0,
    memory: parts.ram?.performance ?? 0,
    storage: parts.storage?.performance ?? 0,
    thermals: Math.round(thermalsScore(parts)),
    efficiency: Math.round(efficiencyScore(parts)),
  };

  let balance = 0;
  if (parts.cpu && parts.gpu) {
    const gap = Math.abs(parts.cpu.performance - parts.gpu.performance);
    balance = clamp(100 - Math.max(0, gap - 10) * 1.5);
  }

  let raw = balance * WEIGHTS.balance;
  for (const k of Object.keys(categories) as ScoreCategory[]) raw += categories[k] * WEIGHTS[k];

  // Conflicts only survive into finished builds in Chaos Mode.
  const penalty = conflicts.reduce((p, c) => p + (c.severity === "error" ? 8 : 2), 0);
  return { total: Math.round(clamp(raw - penalty)), categories, balance: Math.round(balance), penalty };
}
