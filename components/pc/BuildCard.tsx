import Link from "next/link";
import { RarityBadge } from "@/components/ui/PixelBadge";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { resolveSelection } from "@/lib/pc-engine/catalog";
import { RARITY_COLORS } from "@/lib/pc-engine/rarity";
import type { BuildView } from "@/types/db";
import { PcVisualizer } from "./PcVisualizer";

export function BuildCard({ build, rank }: { build: BuildView; rank?: number }) {
  return (
    <Link href={`/build/${build.id}`} className="px-card px-card-hover group block">
      <div className="relative border-b border-line bg-navy-950">
        <PcVisualizer parts={resolveSelection(build.selection)} rgb={build.rgb} label={`${build.name} by @${build.owner.username}`} />
        {rank ? <span className="absolute left-2 top-2 bg-cream px-1.5 py-0.5 text-xs font-bold text-navy-900">#{String(rank).padStart(2, "0")}</span> : null}
        <span className="absolute right-2 top-2">
          <RarityBadge rarity={build.rarity} solid />
        </span>
      </div>
      <div className="flex items-start justify-between gap-3 p-3">
        <div className="min-w-0">
          <div className="truncate font-bold tracking-wide group-hover:text-mint">{build.name}</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-dim">
            <PixelAvatar id={build.owner.avatar} size={16} />
            <span className="truncate">@{build.owner.username}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold leading-none" style={{ color: RARITY_COLORS[build.rarity] }}>
            {build.score}
          </div>
          <div className="mt-1 flex items-center justify-end gap-1 text-xs text-pink">
            <PixelIcon name="heart" size={10} /> {build.likes}
          </div>
        </div>
      </div>
    </Link>
  );
}
