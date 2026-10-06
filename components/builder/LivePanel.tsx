"use client";

import { PcVisualizer } from "@/components/pc/PcVisualizer";
import { RarityBadge } from "@/components/ui/PixelBadge";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { PixelProgressBar } from "@/components/ui/PixelProgressBar";
import { useCountUp } from "@/lib/hooks/useCountUp";
import { formatValue, type BuildSummary } from "@/lib/pc-engine";
import { cn } from "@/lib/utils";
import { RGB_COLORS, type RgbColor } from "@/types/game";

export function LivePanel({ summary, rgb, onRgb, chaos }: { summary: BuildSummary; rgb: RgbColor; onRgb: (c: RgbColor) => void; chaos: boolean }) {
  const score = useCountUp(summary.score.total, 500);
  const value = useCountUp(summary.value, 500);
  const { draw, capacity, headroom } = summary.power;
  const errors = summary.conflicts.filter((c) => c.severity === "error");
  const warnings = summary.conflicts.filter((c) => c.severity === "warning");
  const powerColor = !capacity ? "#6e78a6" : headroom < 0 ? "#f0506e" : headroom < capacity * 0.1 ? "#f7d58b" : "#3ce6b0";

  return (
    <div className="flex flex-col gap-3">
      <div className={cn("relative border bg-navy-950", chaos ? "border-hot/70" : "border-line")}>
        <PcVisualizer parts={summary.parts} rgb={rgb} animated label="Live preview of your rig" />
        <div className="absolute left-2 top-2 flex items-center gap-2">
          {summary.complete ? <RarityBadge rarity={summary.rarity} solid /> : <span className="bg-navy-900/90 px-1.5 py-0.5 font-label text-[0.6rem] tracking-widest text-dim">PREVIEW</span>}
          {chaos ? <span className="bg-hot px-1.5 py-0.5 font-label text-[0.6rem] tracking-widest text-navy-900">CHAOS</span> : null}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="px-panel px-panel-accent px-3 py-2">
          <div className="px-stat-label">PC SCORE</div>
          <div className="text-[1.7rem] font-bold leading-none text-mint tabular-nums">
            {score}
            <span className="text-xs text-dim"> /100</span>
          </div>
        </div>
        <div className="px-panel px-3 py-2">
          <div className="px-stat-label">EST. VALUE</div>
          <div className="text-[1.35rem] font-bold leading-none text-gold tabular-nums">{formatValue(value)}</div>
        </div>
        <div className="px-panel px-3 py-2">
          <div className="px-stat-label">POWER DRAW</div>
          <div className="text-[1.35rem] font-bold leading-none tabular-nums">{draw}W</div>
        </div>
      </div>

      <div className="px-panel px-3 py-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="px-stat-label">PSU {capacity ? `${capacity}W` : "—"}</span>
          <span style={{ color: powerColor }}>{capacity ? `HEADROOM ${headroom}W` : "NO PSU YET"}</span>
        </div>
        <PixelProgressBar className="mt-2" value={capacity ? Math.min(draw, capacity) : 0} max={capacity || 1} color={powerColor} label="Power usage" />
      </div>

      <div className="px-panel flex flex-wrap items-center gap-2 px-3 py-2.5">
        <span className="px-stat-label mr-1">RGB</span>
        {(Object.keys(RGB_COLORS) as RgbColor[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onRgb(c)}
            aria-label={`RGB ${c}`}
            aria-pressed={rgb === c}
            className={cn("h-6 w-6 border-2", rgb === c ? "border-cream" : "border-navy-950 hover:border-line-strong")}
            style={{ background: c === "off" ? "repeating-linear-gradient(45deg,#2a3358 0 3px,#11183a 3px 6px)" : RGB_COLORS[c] }}
          />
        ))}
      </div>

      {errors.length || warnings.length ? (
        <div className={cn("border px-3 py-2.5", errors.length ? (chaos ? "border-hot/60 bg-hot/5" : "border-red/70 bg-red/5") : "border-gold/60 bg-gold/5")} aria-live="polite">
          <div className={cn("flex items-center gap-1.5 text-sm font-bold", errors.length ? (chaos ? "text-hot" : "text-red") : "text-gold")}>
            <PixelIcon name="warn" size={12} />
            {errors.length ? `⚠ HARDWARE CONFLICT ×${errors.length}` : `WARNINGS ×${warnings.length}`}
          </div>
          <ul className="mt-1.5 space-y-1 text-xs text-ink/90">
            {[...errors, ...warnings].map((c) => (
              <li key={c.id} className="flex gap-1.5">
                <span className={c.severity === "error" ? "text-red" : "text-gold"}>▸</span>
                {c.message}
              </li>
            ))}
          </ul>
        </div>
      ) : summary.complete ? (
        <div className="flex items-center gap-2 border border-mint/60 bg-mint/5 px-3 py-2 text-sm text-mint">
          <PixelIcon name="check" size={12} /> All systems compatible. Ready to boot.
        </div>
      ) : null}
    </div>
  );
}
