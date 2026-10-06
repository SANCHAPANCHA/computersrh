// Daily challenge templates. The schedule rotates through these by day index,
// both in the app (fallback) and in the SQL seed — keep the order stable.
import type { ChallengeTemplate } from "../types/content";

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    key: "budget-2000",
    title: "BUILD UNDER $2,000",
    description: "Squeeze the most score out of a tight budget.",
    rules: { maxBudget: 2000, minRamGb: 16, requiredCategories: ["gpu"] },
  },
  {
    key: "max-performance",
    title: "MAXIMUM PERFORMANCE",
    description: "No budget limit. Highest score wins.",
    rules: {},
  },
  {
    key: "energy-efficient",
    title: "ENERGY EFFICIENT",
    description: "Keep total power draw at 500W or below.",
    rules: { maxPower: 500 },
  },
  {
    key: "small-mighty",
    title: "SMALL BUT MIGHTY",
    description: "Build inside a MINI case and still score 60+.",
    rules: { caseSize: "MINI", minScore: 60 },
  },
  {
    key: "common-ground",
    title: "COMMON GROUND",
    description: "Nothing above RARE allowed. Pure skill.",
    rules: { maxRarity: "RARE" },
  },
  {
    key: "memory-lane",
    title: "MEMORY LANE",
    description: "64GB of RAM or more, total value under $3,500.",
    rules: { minRamGb: 64, maxBudget: 3500 },
  },
  {
    key: "retro-night",
    title: "RETRO NIGHT",
    description: "Use the RetroBox case or the RetroTube CRT. Vibes first.",
    rules: { requireAnyOf: ["case-retrobox", "mon-retrotube-17"] },
  },
];
