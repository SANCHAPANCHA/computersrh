import Link from "next/link";
import { PartVisual } from "@/components/pc/PartVisual";
import { PcVisualizer } from "@/components/pc/PcVisualizer";
import { ScoreBars } from "@/components/pc/ScoreBars";
import { RarityBadge } from "@/components/ui/PixelBadge";
import { PixelProgressBar } from "@/components/ui/PixelProgressBar";
import type { RigEval } from "@/lib/game/rig";
import type { InventoryItem } from "@/lib/game/queries";
import { RARITY_COLORS } from "@/lib/pc-engine/rarity";
import { formatValue } from "@/lib/pc-engine/value";
import { CATEGORIES, CATEGORY_LABELS } from "@/types/game";
import { LevelPips } from "./Bits";

export function PcLevelBar({ ev }: { ev: RigEval }) {
  const score = ev.summary.score.total;
  return (
    <div className="px-panel px-3.5 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="px-stat-label">PC LEVEL</span>
        <span className="text-xs text-dim">{ev.nextLevel ? `NEXT: ${ev.nextLevel.name} AT ${ev.nextLevel.minScore}` : "MAX LEVEL"}</span>
      </div>
      <div className="mt-1 flex items-center gap-3">
        <span className="text-2xl font-bold text-lilac">LV {ev.pcLevel}</span>
        <span className="text-lg tracking-wider">{ev.pcLevelName}</span>
      </div>
      <PixelProgressBar className="mt-2" value={ev.nextLevel ? score : 1} max={ev.nextLevel ? ev.nextLevel.minScore : 1} color="#a898e0" label="Progress to next PC level" />
    </div>
  );
}

/** The player's installed rig: visual, score, level and part list. */
export function RigOverview({ ev, inventory, compact }: { ev: RigEval; inventory: InventoryItem[]; compact?: boolean }) {
  const s = ev.summary;
  const color = RARITY_COLORS[s.rarity];
  const inv = new Map(inventory.map((i) => [i.componentId, i]));
  return (
    <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
      <div className="flex flex-col gap-3">
        <div className="relative self-start border border-line bg-navy-950" style={{ boxShadow: `0 0 0 1px ${color}55, 0 0 30px ${color}1f` }}>
          <PcVisualizer parts={s.parts} rgb="violet" animated label="Your PC" />
          <span className="absolute left-2 top-2"><RarityBadge rarity={s.rarity} solid suffix="RIG" /></span>
        </div>
        {!compact ? <ScoreBars categories={s.score.categories} /> : null}
      </div>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="px-panel px-panel-accent px-3.5 py-3">
            <div className="px-stat-label">PC SCORE</div>
            <div className="text-4xl font-bold leading-none tabular-nums" style={{ color }}>{s.score.total}<span className="text-base text-dim"> /100</span></div>
          </div>
          <div className="px-panel px-3.5 py-3">
            <div className="px-stat-label">EST. VALUE</div>
            <div className="text-2xl font-bold text-gold">{formatValue(s.value)}</div>
            <div className="text-xs text-faint">{s.power.draw}W / {s.power.capacity}W</div>
          </div>
        </div>
        <PcLevelBar ev={ev} />
        {s.conflicts.some((c) => c.severity === "error") ? (
          <div className="border border-red/70 bg-red/10 px-3 py-2 text-xs text-ink">
            <b className="text-red">⚠ HARDWARE CONFLICT · </b>
            {s.conflicts.filter((c) => c.severity === "error").map((c) => c.message).join(" ")}
          </div>
        ) : null}
        <ul className="divide-y divide-dashed divide-line border border-line">
          {CATEGORIES.map((cat) => {
            const c = s.parts[cat];
            const item = c ? inv.get(c.id) : undefined;
            return (
              <li key={cat} className="flex items-center gap-2.5 px-2.5 py-1.5">
                {c ? <PartVisual component={c} className="h-6 w-9 flex-none" /> : <span className="h-6 w-9 flex-none" />}
                <span className="px-stat-label w-20 flex-none !text-[0.58rem]">{CATEGORY_LABELS[cat]}</span>
                <span className="min-w-0 flex-1 truncate text-sm">{c?.name ?? "—"}</span>
                {item ? <LevelPips level={item.level} /> : null}
                {item?.spare && item.level < 5 ? (
                  <Link href="/inventory?f=upgrades" className="bg-mint px-1 font-label text-[0.5rem] tracking-widest text-navy-900" title="Upgrade available">▲</Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
