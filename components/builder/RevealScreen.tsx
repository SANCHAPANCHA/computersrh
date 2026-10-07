"use client";

import { PcVisualizer } from "@/components/pc/PcVisualizer";
import { ScoreBars } from "@/components/pc/ScoreBars";
import { RarityBadge } from "@/components/ui/PixelBadge";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { useCountUp } from "@/lib/hooks/useCountUp";
import { formatValue, type BuildSummary } from "@/lib/pc-engine";
import { RARITY_COLORS } from "@/lib/pc-engine/rarity";
import type { ReactNode } from "react";
import type { RgbColor } from "@/types/game";

interface Props {
  summary: BuildSummary;
  rgb: RgbColor;
  name: string;
  onName: (n: string) => void;
  chaos: boolean;
  buildTimeSeconds: number | null;
  saving: boolean;
  onSave: () => void;
  onShare: () => void;
  onAgain: () => void;
  onEdit: () => void;
  /** Replaces save/share/again (used by "My PC" installs). */
  customActions?: ReactNode;
  title?: string;
}

export function RevealScreen({ summary, rgb, name, onName, chaos, buildTimeSeconds, saving, onSave, onShare, onAgain, onEdit, customActions, title }: Props) {
  const score = useCountUp(summary.score.total, 1400, 0);
  const color = RARITY_COLORS[summary.rarity];
  const fmtTime = buildTimeSeconds !== null ? `${Math.floor(buildTimeSeconds / 60)}:${String(buildTimeSeconds % 60).padStart(2, "0")}` : null;

  return (
    <RetroWindow title="RIG_READY.EXE" tag={chaos ? "CHAOS" : "RH"} footerLeft={name} footerRight={fmtTime ? <>BUILD TIME {fmtTime}{buildTimeSeconds! <= 120 ? " · SPEEDRUN" : ""}</> : undefined}>
      <div className="text-center">
        <div className="kicker justify-center">✧ SYSTEM READY</div>
        <h1 className="h-display mt-2 text-4xl sm:text-5xl">{title ?? "YOUR RIG IS READY"}</h1>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="relative self-start border border-line bg-navy-950" style={{ boxShadow: `0 0 0 1px ${color}55, 0 0 40px ${color}22` }}>
          <div style={{ animation: "reveal-flash 0.9s steps(8, end) both" }}>
            <PcVisualizer parts={summary.parts} rgb={rgb} animated label={`${name} — final build`} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div style={{ animation: "pop 0.4s 1s steps(4, end) both" }}>
                <RarityBadge rarity={summary.rarity} solid suffix="RIG" className="!text-sm" />
              </div>
              <div className="mt-3 font-bold leading-none tabular-nums" style={{ color }}>
                <span className="text-7xl">{score}</span>
                <span className="text-2xl text-dim"> / 100</span>
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="px-stat-label">EST. VALUE</div>
              <div className="text-2xl font-bold text-gold">{formatValue(summary.value)}</div>
              <div className="px-stat-label mt-2">POWER</div>
              <div className="text-2xl font-bold">{summary.power.draw}W</div>
            </div>
          </div>
          <ScoreBars categories={summary.score.categories} />
          {summary.score.penalty ? <p className="text-xs text-hot">Chaos penalty −{summary.score.penalty} for hardware conflicts.</p> : null}
          {customActions ? null : (
            <div>
              <label htmlFor="rig-name" className="px-label !text-sm">Rig name</label>
              <input id="rig-name" className="px-input" value={name} maxLength={32} onChange={(e) => onName(e.target.value)} />
            </div>
          )}
        </div>
      </div>

      {customActions ? <div className="mt-6 grid gap-3 sm:grid-cols-3">{customActions}</div> : (
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <button type="button" onClick={onSave} disabled={saving} className="px-btn px-btn-mint px-btn-lg">
          <PixelIcon name="floppy" size={14} /> {saving ? "SAVING..." : "SAVE BUILD"}
        </button>
        <button type="button" onClick={onShare} className="px-btn px-btn-lg">
          <PixelIcon name="star" size={14} /> SHARE BUILD
        </button>
        <button type="button" onClick={onAgain} className="px-btn px-btn-ghost px-btn-lg">
          <PixelIcon name="power" size={14} /> BUILD AGAIN
        </button>
      </div>
      )}
      <div className="mt-3 text-center">
        <button type="button" onClick={onEdit} className="text-sm text-dim underline-offset-4 hover:text-mint hover:underline">
          ← Tweak parts
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-faint">Values are fictional in-game data, not real market prices.</p>
    </RetroWindow>
  );
}
