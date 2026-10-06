import Link from "next/link";
import { RarityBadge } from "@/components/ui/PixelBadge";
import type { PresetRig } from "@/data/presets";
import { encodeSelection, evaluateSelection, formatValue } from "@/lib/pc-engine";
import { RARITY_COLORS } from "@/lib/pc-engine/rarity";
import { PcVisualizer } from "./PcVisualizer";

export function PresetCard({ preset }: { preset: PresetRig }) {
  const s = evaluateSelection(preset.selection);
  return (
    <Link href={`/builder?parts=${encodeSelection(preset.selection)}&rgb=${preset.rgb}`} className="px-card px-card-hover group block">
      <div className="relative border-b border-line bg-navy-950">
        <PcVisualizer parts={s.parts} rgb={preset.rgb} label={preset.name} />
        <span className="absolute left-2 top-2 bg-navy-900/90 px-1.5 py-0.5 font-label text-[0.6rem] tracking-widest text-lilac">LAB PRESET</span>
        <span className="absolute right-2 top-2">
          <RarityBadge rarity={s.rarity} solid />
        </span>
      </div>
      <div className="flex items-start justify-between gap-3 p-3">
        <div className="min-w-0">
          <div className="truncate font-bold tracking-wide group-hover:text-mint">{preset.name}</div>
          <div className="mt-1 text-xs text-dim">{preset.tagline}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold leading-none" style={{ color: RARITY_COLORS[s.rarity] }}>{s.score.total}</div>
          <div className="mt-1 text-xs text-gold">{formatValue(s.value)}</div>
        </div>
      </div>
    </Link>
  );
}
