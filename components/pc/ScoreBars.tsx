import { PixelProgressBar } from "@/components/ui/PixelProgressBar";
import { SCORE_CATEGORIES, type ScoreCategory } from "@/lib/pc-engine/scoring";
import { cn } from "@/lib/utils";

const COLORS: Record<ScoreCategory, string> = {
  compute: "#3ce6b0",
  graphics: "#ff7eb6",
  memory: "#a898e0",
  storage: "#5eb0ff",
  thermals: "#7fd8ff",
  efficiency: "#f7d58b",
};

export function ScoreBars({ categories, className, compact }: { categories: Record<ScoreCategory, number>; className?: string; compact?: boolean }) {
  return (
    <dl className={cn("grid gap-2.5", className)}>
      {SCORE_CATEGORIES.map((k) => (
        <div key={k} className="grid grid-cols-[6.5rem_1fr_2.2rem] items-center gap-3">
          <dt className={cn("px-stat-label", compact && "!text-[0.6rem]")}>{k}</dt>
          <PixelProgressBar value={categories[k]} color={COLORS[k]} label={`${k} score`} />
          <dd className="text-right text-sm font-bold tabular-nums">{categories[k]}</dd>
        </div>
      ))}
    </dl>
  );
}
