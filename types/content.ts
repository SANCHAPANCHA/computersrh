import type { CaseSize, Category, Rarity } from "./game";

export type AchievementRequirement = "builds_count" | "best_score" | "min_rarity" | "likes_received" | "speedrun";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirementType: AchievementRequirement;
  requirementValue: number;
}

export interface ChallengeRules {
  maxBudget?: number;
  maxPower?: number;
  minScore?: number;
  minRamGb?: number;
  caseSize?: CaseSize;
  maxRarity?: Rarity;
  requiredCategories?: Category[];
  requireAnyOf?: string[];
}

export interface ChallengeTemplate {
  key: string;
  title: string;
  description: string;
  rules: ChallengeRules;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  rules: ChallengeRules;
  startDate: string;
  endDate: string;
}
