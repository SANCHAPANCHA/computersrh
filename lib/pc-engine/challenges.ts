import { CHALLENGE_TEMPLATES } from "@/data/challenges";
import type { ChallengeRules, DailyChallenge } from "@/types/content";
import { CATEGORY_LABELS } from "@/types/game";
import { hasErrors } from "./compatibility";
import type { BuildSummary } from "./evaluate";
import { rarityRank } from "./rarity";
import { formatValue } from "./value";

export function describeRules(rules: ChallengeRules): string[] {
  const out: string[] = [];
  if (rules.maxBudget) out.push(`Budget: ${formatValue(rules.maxBudget)}`);
  if (rules.maxPower) out.push(`Max power: ${rules.maxPower}W`);
  if (rules.minScore) out.push(`Minimum score: ${rules.minScore}`);
  if (rules.minRamGb) out.push(`Minimum RAM: ${rules.minRamGb}GB`);
  if (rules.caseSize) out.push(`Case size: ${rules.caseSize}`);
  if (rules.maxRarity) out.push(`No parts above ${rules.maxRarity}`);
  for (const c of rules.requiredCategories ?? []) out.push(`${CATEGORY_LABELS[c]} required`);
  if (rules.requireAnyOf?.length) out.push("Use a featured retro part");
  out.push("No hardware conflicts");
  if (out.length === 1) out.unshift("No budget limit");
  return out;
}

export function checkChallenge(rules: ChallengeRules, b: BuildSummary): string[] {
  const fails: string[] = [];
  const p = b.parts;
  if (!b.complete) fails.push("Build is incomplete.");
  if (hasErrors(b.conflicts)) fails.push("Chaos builds with hardware conflicts can't enter.");
  if (rules.maxBudget && b.value > rules.maxBudget) fails.push(`Over budget: ${formatValue(b.value)} > ${formatValue(rules.maxBudget)}.`);
  if (rules.maxPower && b.power.draw > rules.maxPower) fails.push(`Draws ${b.power.draw}W, limit is ${rules.maxPower}W.`);
  if (rules.minScore && b.score.total < rules.minScore) fails.push(`Score ${b.score.total} is below ${rules.minScore}.`);
  if (rules.minRamGb && (p.ram?.metadata.capacityGb ?? 0) < rules.minRamGb) fails.push(`Needs at least ${rules.minRamGb}GB RAM.`);
  if (rules.caseSize && p.case?.metadata.size !== rules.caseSize) fails.push(`Case must be ${rules.caseSize}.`);
  if (rules.maxRarity) {
    const max = rarityRank(rules.maxRarity);
    const over = Object.values(p).filter((c) => c && rarityRank(c.rarity) > max);
    if (over.length) fails.push(`Parts above ${rules.maxRarity}: ${over.map((c) => c!.name).join(", ")}.`);
  }
  for (const c of rules.requiredCategories ?? []) if (!p[c]) fails.push(`${CATEGORY_LABELS[c]} required.`);
  if (rules.requireAnyOf?.length) {
    const ids = Object.values(p).map((c) => c?.id);
    if (!rules.requireAnyOf.some((id) => ids.includes(id))) fails.push("Missing a required featured part.");
  }
  return fails;
}

const DAY_MS = 86_400_000;

export function todayUtc(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Deterministic fallback schedule — mirrors the SQL seed rotation. */
export function challengeForDate(date: string): DailyChallenge {
  const dayIndex = Math.floor(Date.parse(`${date}T00:00:00Z`) / DAY_MS);
  const t = CHALLENGE_TEMPLATES[((dayIndex % CHALLENGE_TEMPLATES.length) + CHALLENGE_TEMPLATES.length) % CHALLENGE_TEMPLATES.length];
  return { id: date, title: t.title, description: t.description, rules: t.rules, startDate: date, endDate: date };
}
