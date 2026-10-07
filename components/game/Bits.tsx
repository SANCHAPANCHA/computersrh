import type { ReactNode } from "react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { cn } from "@/lib/utils";

export function Credits({ value, className, sign }: { value: number; className?: string; sign?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 tabular-nums text-gold", className)}>
      <PixelIcon name="coin" size={14} />
      {sign && value > 0 ? "+" : ""}
      {value.toLocaleString("en-US")}
    </span>
  );
}

export function LevelPips({ level, max = 5, className }: { level: number; max?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`Level ${level} of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={cn("h-2.5 w-2.5 border", i < level ? "border-gold bg-gold" : "border-line-strong bg-navy-950")} />
      ))}
    </span>
  );
}

export function GameStat({ label, value, sub, accent, className }: { label: string; value: ReactNode; sub?: ReactNode; accent?: "mint" | "gold" | "pink" | "lilac"; className?: string }) {
  const color = { mint: "text-mint", gold: "text-gold", pink: "text-pink", lilac: "text-lilac" }[accent ?? "mint"] ?? "text-ink";
  return (
    <div className={cn("px-panel px-3.5 py-3", accent === "mint" && "px-panel-accent", className)}>
      <div className="px-stat-label">{label}</div>
      <div className={cn("mt-1 text-2xl font-bold leading-none", accent ? color : "text-ink")}>{value}</div>
      {sub ? <div className="mt-1.5 text-xs text-faint">{sub}</div> : null}
    </div>
  );
}
