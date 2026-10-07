"use client";

import { PartVisual } from "@/components/pc/PartVisual";
import { RarityBadge } from "@/components/ui/PixelBadge";
import { PixelIcon } from "@/components/ui/PixelIcon";
import type { Conflict } from "@/lib/pc-engine";
import { RARITY_COLORS } from "@/lib/pc-engine/rarity";
import { partSpecs } from "@/lib/pc-engine/specs";
import { formatValue } from "@/lib/pc-engine/value";
import { cn } from "@/lib/utils";
import type { GameComponent } from "@/types/game";

interface Props {
  component: GameComponent;
  selected: boolean;
  conflicts: Conflict[];
  chaos: boolean;
  onSelect: () => void;
  /** "My PC" mode: ownership, level and credit price. */
  rigInfo?: { owned: boolean; level: number; spare: number; price: number; locked: boolean };
}

export function PartCard({ component: c, selected, conflicts, chaos, onSelect, rigInfo }: Props) {
  const errors = conflicts.filter((x) => x.severity === "error");
  const warnings = conflicts.filter((x) => x.severity === "warning");
  const locked = Boolean(rigInfo?.locked);
  const blocked = (errors.length > 0 && !chaos) || locked;
  const color = RARITY_COLORS[c.rarity];

  return (
    <article
      className={cn(
        "px-card flex flex-col",
        selected ? "!border-mint shadow-[0_0_0_1px_var(--color-mint),4px_4px_0_0_#137a5f]" : blocked ? "opacity-75" : "px-card-hover",
      )}
      aria-label={`${c.name}, ${c.rarity}${blocked ? ", incompatible" : ""}`}
    >
      <div className="flex gap-3 p-3">
        <div className="relative grid h-20 w-24 flex-none place-items-center border border-line bg-navy-950" style={{ boxShadow: `inset 0 -3px 0 ${color}` }}>
          <PartVisual component={c} className="h-16 w-24" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <RarityBadge rarity={c.rarity} />
            {rigInfo && rigInfo.level > 1 ? <span className="bg-gold px-1.5 py-0.5 font-label text-[0.58rem] tracking-widest text-navy-900">LV{rigInfo.level}</span> : null}
            {selected ? <span className="font-label text-[0.6rem] tracking-widest text-mint">✓ INSTALLED</span> : null}
          </div>
          <h3 className="mt-1.5 text-lg font-bold leading-tight">{c.name}</h3>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm">
            <span className="text-mint">PERF +{c.performance}</span>
            {c.power ? <span className="text-dim">POWER {c.power}W</span> : null}
            {rigInfo ? (
              rigInfo.owned ? (
                <span className="text-mint">OWNED{rigInfo.spare ? ` · +${rigInfo.spare} SPARE` : ""}</span>
              ) : locked ? (
                <span className="text-hot">ROULETTE ONLY</span>
              ) : (
                <span className="text-gold">{rigInfo.price.toLocaleString("en-US")} CR</span>
              )
            ) : (
              <span className="text-gold">{formatValue(c.price)}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 px-3">
        {partSpecs(c).map((s) => (
          <span key={s} className="border border-line px-1.5 py-0.5 font-label text-[0.58rem] tracking-wider text-dim">{s}</span>
        ))}
      </div>
      <p className="read px-3 pt-2 text-xs text-dim">{c.description}</p>

      {errors.length ? (
        <div className={cn("mx-3 mt-3 border px-3 py-2", chaos ? "border-hot/60 bg-hot/10" : "border-red/70 bg-red/10")} role="note">
          <div className={cn("flex items-center gap-1.5 text-sm font-bold tracking-wide", chaos ? "text-hot" : "text-red")}>
            <PixelIcon name="warn" size={12} /> {chaos ? "CONFLICT IGNORED · CHAOS" : "HARDWARE CONFLICT"}
          </div>
          <ul className="mt-1 space-y-1 text-xs text-ink/90">
            {errors.map((e) => <li key={e.id}>{e.message}</li>)}
          </ul>
        </div>
      ) : null}
      {warnings.length ? (
        <div className="mx-3 mt-2 border border-gold/60 bg-gold/10 px-3 py-2 text-xs" role="note">
          <span className="font-bold text-gold">⚠ WARNING </span>
          {warnings.map((w) => w.message).join(" ")}
        </div>
      ) : null}

      <div className="mt-auto p-3">
        <button
          type="button"
          onClick={onSelect}
          disabled={blocked}
          aria-pressed={selected}
          className={cn("px-btn px-btn-sm w-full", selected ? "px-btn-mint" : "")}
        >
          {locked ? "[ WIN IN ROULETTE ]" : blocked ? "[ INCOMPATIBLE ]" : selected ? "[ SELECTED ✓ ]" : rigInfo && !rigInfo.owned ? `[ ADD · ${rigInfo.price.toLocaleString("en-US")} CR ]` : "[ SELECT ]"}
        </button>
      </div>
    </article>
  );
}
