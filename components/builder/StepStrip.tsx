"use client";

import { PixelIcon } from "@/components/ui/PixelIcon";
import type { Conflict } from "@/lib/pc-engine";
import { cn } from "@/lib/utils";
import { CATEGORIES, type Selection } from "@/types/game";

const SHORT: Record<string, string> = { case: "CASE", cpu: "CPU", gpu: "GPU", motherboard: "MOBO", ram: "RAM", storage: "SSD", psu: "PSU", cooling: "COOL", monitor: "MON", keyboard: "KEYS", mouse: "MOUSE" };

export function StepStrip({ step, selection, conflicts, onStep }: { step: number; selection: Selection; conflicts: Conflict[]; onStep: (n: number) => void }) {
  return (
    <nav aria-label="Build steps" className="-mx-1 overflow-x-auto px-1 pb-1">
      <ol className="grid min-w-[640px] grid-cols-11 gap-1.5">
        {CATEGORIES.map((cat, i) => {
          const done = Boolean(selection[cat]);
          const bad = conflicts.some((c) => c.severity === "error" && c.categories.includes(cat));
          const current = i === step;
          return (
            <li key={cat}>
              <button
                type="button"
                onClick={() => onStep(i)}
                aria-current={current ? "step" : undefined}
                aria-label={`Step ${i + 1}: ${cat}${done ? " (selected)" : ""}${bad ? " (conflict)" : ""}`}
                className={cn(
                  "relative flex w-full flex-col items-center gap-1 border px-1 py-2 text-[0.62rem] tracking-wider transition-colors",
                  current ? "border-mint bg-mint text-navy-900" : bad ? "border-red/70 bg-red/10 text-red" : done ? "border-line-strong bg-navy-700 text-ink" : "border-line bg-navy-900 text-faint hover:text-dim",
                )}
              >
                <PixelIcon name={cat} size={16} />
                {SHORT[cat]}
                {done && !current ? <span className={cn("absolute right-1 top-1 h-1.5 w-1.5", bad ? "bg-red" : "bg-mint")} /> : null}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
