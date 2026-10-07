"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PartVisual } from "@/components/pc/PartVisual";
import { RarityBadge } from "@/components/ui/PixelBadge";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { useToast } from "@/components/ui/PixelToast";
import { EmptyState } from "@/components/ui/States";
import type { GameConfig } from "@/data/economy";
import { installPart } from "@/lib/game/actions";
import type { InventoryItem } from "@/lib/game/queries";
import { getComponent } from "@/lib/pc-engine/catalog";
import { leveled } from "@/lib/pc-engine/levels";
import { RARITY_COLORS } from "@/lib/pc-engine/rarity";
import { play } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { CATEGORIES, CATEGORY_LABELS } from "@/types/game";
import { LevelPips } from "./Bits";
import { statLines, UpgradeModal } from "./UpgradeModal";

type Filter = "all" | "upgrades" | "installed";

export function InventoryGrid({ items, installed, hasRig, upgrades, initialFilter }: { items: InventoryItem[]; installed: string[]; hasRig: boolean; upgrades: GameConfig["upgrades"]; initialFilter: Filter }) {
  const router = useRouter();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [upgrading, setUpgrading] = useState<InventoryItem | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const canUp = (i: InventoryItem) => i.spare > 0 && i.level < upgrades.maxLevel;
  const upgradable = items.filter(canUp).length;

  const shown = useMemo(
    () => items.filter((i) => (filter === "upgrades" ? canUp(i) : filter === "installed" ? installed.includes(i.componentId) : true)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, filter, installed],
  );

  async function install(id: string) {
    setBusy(id);
    const res = await installPart(id);
    setBusy(null);
    if (!res.ok) {
      play("error");
      return toast({ tone: "error", title: "INSTALL FAILED", message: res.error });
    }
    play("select");
    toast({ tone: "success", title: "PART INSTALLED", message: `PC score now ${res.score}` });
    router.refresh();
  }

  if (!items.length) return <EmptyState title="NO PARTS YET" message="Buy parts in the shop or win them in the daily roulette." action={{ href: "/builder?mode=rig", label: "BUILD YOUR FIRST PC" }} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter inventory">
        {([["all", `ALL · ${items.length}`], ["upgrades", `UPGRADES AVAILABLE · ${upgradable}`], ["installed", "INSTALLED"]] as [Filter, string][]).map(([f, label]) => (
          <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className="px-tab">{label}</button>
        ))}
      </div>
      {shown.length === 0 ? <div className="px-dashed px-4 py-8 text-center text-sm text-dim">{filter === "upgrades" ? "No duplicates yet. Buy or win a second copy of a part to upgrade it." : "Nothing here."}</div> : null}
      {CATEGORIES.map((cat) => {
        const group = shown.filter((i) => getComponent(i.componentId)?.category === cat);
        if (!group.length) return null;
        return (
          <section key={cat}>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold tracking-widest text-dim"><PixelIcon name={cat} size={14} className="text-lilac" /> {CATEGORY_LABELS[cat]}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((i) => {
                const c = leveled(getComponent(i.componentId)!, i.level, upgrades);
                const isIn = installed.includes(i.componentId);
                return (
                  <article key={i.componentId} className={cn("px-card flex flex-col p-3", canUp(i) && "!border-mint")}>
                    <div className="flex gap-3">
                      <div className="grid h-16 w-20 flex-none place-items-center border border-line bg-navy-950" style={{ boxShadow: `inset 0 -3px 0 ${RARITY_COLORS[c.rarity]}` }}>
                        <PartVisual component={c} className="h-14 w-20" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <RarityBadge rarity={c.rarity} />
                          {isIn ? <span className="font-label text-[0.55rem] tracking-widest text-mint">INSTALLED</span> : null}
                        </div>
                        <h4 className="mt-1 truncate font-bold">{c.name}</h4>
                        <div className="mt-1 flex items-center gap-2 text-xs">
                          <span className="font-bold text-gold">LEVEL {i.level}</span>
                          <LevelPips level={i.level} max={upgrades.maxLevel} />
                        </div>
                      </div>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                      {statLines(c).map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-2 border-b border-dashed border-line py-0.5">
                          <dt className="text-dim">{k}</dt>
                          <dd className="font-bold tabular-nums">{v}</dd>
                        </div>
                      ))}
                      <div className="flex justify-between gap-2 border-b border-dashed border-line py-0.5">
                        <dt className="text-dim">COPIES</dt>
                        <dd className="font-bold tabular-nums">{1 + i.spare}</dd>
                      </div>
                    </dl>
                    {canUp(i) ? <div className="mt-2 text-xs font-bold text-mint">DUPLICATE FOUND · UPGRADE AVAILABLE</div> : i.level >= upgrades.maxLevel ? <div className="mt-2 text-xs text-gold">MAX LEVEL</div> : null}
                    <div className="mt-auto flex gap-2 pt-3">
                      {canUp(i) ? (
                        <button type="button" className="px-btn px-btn-mint px-btn-sm flex-1" onClick={() => setUpgrading(i)}><PixelIcon name="up" size={10} /> UPGRADE</button>
                      ) : null}
                      {!isIn && hasRig ? (
                        <button type="button" className="px-btn px-btn-ghost px-btn-sm flex-1" disabled={busy === i.componentId} onClick={() => install(i.componentId)}>
                          {busy === i.componentId ? "..." : "INSTALL"}
                        </button>
                      ) : null}
                      {!canUp(i) && i.level < upgrades.maxLevel ? (
                        <Link href="/shop" className="px-btn px-btn-ghost px-btn-sm flex-1 !text-[0.7rem]">GET COPY</Link>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
      <UpgradeModal componentId={upgrading?.componentId ?? null} level={upgrading?.level ?? 1} upgrades={upgrades} onClose={() => setUpgrading(null)} />
    </div>
  );
}
