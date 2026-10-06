import Link from "next/link";
import type { ReactNode } from "react";
import { RarityBadge } from "@/components/ui/PixelBadge";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { evaluateSelection, formatValue } from "@/lib/pc-engine";
import { RARITY_COLORS } from "@/lib/pc-engine/rarity";
import type { RgbColor, Selection } from "@/types/game";
import { ComponentList } from "./ComponentList";
import { PcVisualizer } from "./PcVisualizer";
import { ScoreBars } from "./ScoreBars";

interface Props {
  title: string;
  heading: string;
  name: string;
  owner?: { username: string; avatar: string } | null;
  selection: Selection;
  rgb: RgbColor;
  chaos?: boolean;
  actions: ReactNode;
  notice?: ReactNode;
  footerRight?: ReactNode;
}

/** Shared read-only build view for /build/[id] and /share. */
export function BuildDetail({ title, heading, name, owner, selection, rgb, chaos, actions, notice, footerRight }: Props) {
  const s = evaluateSelection(selection);
  const color = RARITY_COLORS[s.rarity];
  return (
    <div className="page-enter mx-auto flex max-w-5xl flex-col gap-6">
      {notice}
      <RetroWindow title={title} tag={chaos ? <span className="text-hot">CHAOS</span> : "RH"} footerLeft="RH PC LAB · community build" footerRight={footerRight}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="kicker">✧ {heading}</div>
            <h1 className="h-display mt-2 text-4xl break-words sm:text-5xl">{name}</h1>
            <div className="mt-3 flex items-center gap-2 text-sm text-dim">
              Built by
              {owner ? (
                <Link href={`/u/${owner.username}`} className="flex items-center gap-2 text-mint hover:underline">
                  <PixelAvatar id={owner.avatar} size={22} /> @{owner.username}
                </Link>
              ) : (
                <span className="text-ink">a lab guest</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <RarityBadge rarity={s.rarity} solid suffix="RIG" className="!text-sm" />
            <div className="mt-2 font-bold leading-none tabular-nums" style={{ color }}>
              <span className="text-6xl">{s.score.total}</span>
              <span className="text-xl text-dim"> / 100</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="self-start border border-line bg-navy-950" style={{ boxShadow: `0 0 0 1px ${color}44` }}>
            <PcVisualizer parts={s.parts} rgb={rgb} animated label={`${name} pixel preview`} />
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="px-panel px-3 py-2">
                <div className="px-stat-label">EST. VALUE</div>
                <div className="text-xl font-bold text-gold">{formatValue(s.value)}</div>
              </div>
              <div className="px-panel px-3 py-2">
                <div className="px-stat-label">POWER</div>
                <div className="text-xl font-bold">{s.power.draw}W</div>
              </div>
              <div className="px-panel px-3 py-2">
                <div className="px-stat-label">PSU</div>
                <div className="text-xl font-bold">{s.power.capacity}W</div>
              </div>
            </div>
            <ScoreBars categories={s.score.categories} />
            <div className="mt-auto flex flex-wrap gap-3">{actions}</div>
          </div>
        </div>

        <h2 className="mt-8 mb-3 text-xl font-bold tracking-wide">COMPONENTS</h2>
        <ComponentList selection={selection} />
        <p className="mt-3 text-xs text-faint">All parts and values are fictional RH PC LAB game data.</p>
      </RetroWindow>
    </div>
  );
}
