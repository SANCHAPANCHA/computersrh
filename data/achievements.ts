import type { AchievementDef } from "../types/content";

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-boot", name: "FIRST BOOT", description: "Create your first PC.", icon: "power", requirementType: "builds_count", requirementValue: 1 },
  { id: "hardware-engineer", name: "HARDWARE ENGINEER", description: "Create 5 PCs.", icon: "wrench", requirementType: "builds_count", requirementValue: 5 },
  { id: "maxed-out", name: "MAXED OUT", description: "Reach a 95+ score.", icon: "bolt", requirementType: "best_score", requirementValue: 95 },
  { id: "legendary", name: "LEGENDARY", description: "Build a Legendary PC.", icon: "crown", requirementType: "min_rarity", requirementValue: 4 },
  { id: "mythic", name: "MYTHIC", description: "Build a Mythic PC.", icon: "gem", requirementType: "min_rarity", requirementValue: 5 },
  { id: "collector", name: "COLLECTOR", description: "Save 10 builds.", icon: "floppy", requirementType: "builds_count", requirementValue: 10 },
  { id: "community-builder", name: "COMMUNITY BUILDER", description: "Receive 50 likes.", icon: "heart", requirementType: "likes_received", requirementValue: 50 },
  { id: "speedrunner", name: "SPEEDRUNNER", description: "Complete a PC in under 2 minutes.", icon: "clock", requirementType: "speedrun", requirementValue: 120 },
];
