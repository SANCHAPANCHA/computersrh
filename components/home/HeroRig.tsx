"use client";

import { useEffect, useState } from "react";
import { PcVisualizer } from "@/components/pc/PcVisualizer";
import { RarityBadge } from "@/components/ui/PixelBadge";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { PRESETS } from "@/data/presets";
import { evaluateSelection, formatValue } from "@/lib/pc-engine";
import { cn } from "@/lib/utils";

const RIGS = PRESETS.map((p) => ({ ...p, summary: evaluateSelection(p.selection) }));

/** Hero preview that cycles through lab presets like an attract-mode screen. */
export function HeroRig() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((n) => (n + 1) % RIGS.length), 3800);
    return () => clearInterval(id);
  }, [paused]);
  const rig = RIGS[i];

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <RetroWindow title="RIG_PREVIEW.EXE" tag="RH" bodyClassName="p-3 sm:p-4" footerLeft={rig.name} footerRight={<><span className="inline-block h-2 w-2 bg-mint" /> ATTRACT MODE</>}>
        <div className="relative border border-line bg-navy-950">
          <PcVisualizer key={rig.key} parts={rig.summary.parts} rgb={rig.rgb} animated className="animate-rise" label={`${rig.name} preview`} />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <RarityBadge rarity={rig.summary.rarity} solid />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="px-panel px-3 py-2">
            <div className="px-stat-label">SCORE</div>
            <div className="text-2xl font-bold text-mint">{rig.summary.score.total}<span className="text-sm text-dim">/100</span></div>
          </div>
          <div className="px-panel px-3 py-2">
            <div className="px-stat-label">EST. VALUE</div>
            <div className="text-2xl font-bold text-gold">{formatValue(rig.summary.value)}</div>
          </div>
          <div className="px-panel px-3 py-2">
            <div className="px-stat-label">POWER</div>
            <div className="text-2xl font-bold">{rig.summary.power.draw}W</div>
          </div>
        </div>
        <div className="mt-3 flex justify-center gap-2" role="tablist" aria-label="Preview rigs">
          {RIGS.map((r, n) => (
            <button
              key={r.key}
              type="button"
              role="tab"
              aria-selected={n === i}
              aria-label={r.name}
              onClick={() => setI(n)}
              className={cn("h-2.5 w-6 border border-line-strong", n === i ? "bg-mint" : "bg-navy-950 hover:bg-line")}
            />
          ))}
        </div>
      </RetroWindow>
    </div>
  );
}
