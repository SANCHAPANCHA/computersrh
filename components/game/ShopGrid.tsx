"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PartVisual } from "@/components/pc/PartVisual";
import { RarityBadge } from "@/components/ui/PixelBadge";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { useToast } from "@/components/ui/PixelToast";
import { COMPONENTS } from "@/data/components";
import type { GameConfig } from "@/data/economy";
import { buyComponent } from "@/lib/game/actions";
import { RARITY_COLORS } from "@/lib/pc-engine/rarity";
import { partSpecs } from "@/lib/pc-engine/specs";
import { play } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { CATEGORIES, CATEGORY_LABELS, RARITIES, type Category } from "@/types/game";
import { Credits, LevelPips } from "./Bits";
import { UpgradeModal } from "./UpgradeModal";

interface Props {
  credits: number;
  owned: Record<string, { level: number; spare: number }>;
  installed: string[];
  cfg: Pick<GameConfig, "shop" | "upgrades">;
}

export function ShopGrid({ credits, owned, installed, cfg }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [cat, setCat] = useState<Category>("gpu");
  const [sort, setSort] = useState<"price" | "rarity">("price");
  const [busy, setBusy] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const price = (p: number) => Math.max(1, Math.round(p * cfg.shop.priceMultiplier));

  const list = useMemo(
    () =>
      COMPONENTS.filter((c) => c.category === cat).sort((a, b) =>
        sort === "price" ? a.price - b.price : RARITIES.indexOf(a.rarity) - RARITIES.indexOf(b.rarity) || a.price - b.price,
      ),
    [cat, sort],
  );

  async function buy(id: string, name: string) {
    setBusy(id);
    const res = await buyComponent(id);
    setBusy(null);
    if (!res.ok) {
      play("error");
      return toast({ tone: "error", title: "PURCHASE FAILED", message: res.error });
    }
    play("select");
    toast(
      res.duplicate
        ? { tone: "achievement", title: "DUPLICATE FOUND · UPGRADE AVAILABLE", message: `${name}: ${res.spare} spare cop${res.spare === 1 ? "y" : "ies"} ready to fuse.` }
        : { tone: "success", title: "ADDED TO INVENTORY", message: `${name} · balance ${res.balance.toLocaleString("en-US")} CR` },
    );
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="-mx-1 flex flex-1 gap-1.5 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Category">
          {CATEGORIES.map((c) => (
            <button key={c} type="button" role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className="px-tab flex items-center gap-1.5 !text-xs">
              <PixelIcon name={c} size={12} /> {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
        <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as "price" | "rarity")} className="px-input !w-auto !py-1.5 !text-sm">
          <option value="price">PRICE ↑</option>
          <option value="rarity">RARITY</option>
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => {
          const own = owned[c.id];
          const locked = cfg.shop.unbuyable.includes(c.rarity);
          const cost = price(c.price);
          const canAfford = credits >= cost;
          const canUpgrade = Boolean(own && own.spare > 0 && own.level < cfg.upgrades.maxLevel);
          return (
            <article key={c.id} className={cn("px-card flex flex-col", own && "!border-line-strong")}>
              <div className="flex gap-3 p-3">
                <div className="grid h-16 w-20 flex-none place-items-center border border-line bg-navy-950" style={{ boxShadow: `inset 0 -3px 0 ${RARITY_COLORS[c.rarity]}` }}>
                  <PartVisual component={c} className="h-14 w-20" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <RarityBadge rarity={c.rarity} />
                    {installed.includes(c.id) ? <span className="font-label text-[0.55rem] tracking-widest text-mint">INSTALLED</span> : null}
                  </div>
                  <h3 className="mt-1 truncate font-bold">{c.name}</h3>
                  <div className="text-xs text-mint">PERF {c.performance}{c.power ? <span className="text-dim"> · {c.power}W</span> : null}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 px-3">
                {partSpecs(c).slice(0, 3).map((s) => <span key={s} className="border border-line px-1.5 py-0.5 font-label text-[0.55rem] tracking-wider text-dim">{s}</span>)}
              </div>
              {own ? (
                <div className="mx-3 mt-2 flex items-center justify-between gap-2 border border-dashed border-line px-2 py-1.5 text-xs">
                  <span className="flex items-center gap-2">OWNED <LevelPips level={own.level} max={cfg.upgrades.maxLevel} /></span>
                  {canUpgrade ? <span className="font-bold text-mint">UPGRADE AVAILABLE</span> : own.level >= cfg.upgrades.maxLevel ? <span className="text-gold">MAX LEVEL</span> : <span className="text-faint">buy again to upgrade</span>}
                </div>
              ) : null}
              <div className="mt-auto flex items-center gap-2 p-3">
                {locked ? (
                  <Link href="/daily" className="px-btn px-btn-ghost px-btn-sm w-full !text-hot">ROULETTE ONLY ▶</Link>
                ) : (
                  <>
                    <Credits value={cost} className={cn("flex-1 text-lg font-bold", !canAfford && "!text-red")} />
                    {canUpgrade ? (
                      <button type="button" className="px-btn px-btn-sm" onClick={() => setUpgrading(c.id)}><PixelIcon name="up" size={10} /> UPGRADE</button>
                    ) : null}
                    <button type="button" className={cn("px-btn px-btn-sm", own ? "" : "px-btn-mint")} disabled={!canAfford || busy === c.id} onClick={() => buy(c.id, c.name)}>
                      {busy === c.id ? "..." : own ? "BUY COPY" : "BUY"}
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <UpgradeModal componentId={upgrading} level={upgrading ? (owned[upgrading]?.level ?? 1) : 1} upgrades={cfg.upgrades} onClose={() => setUpgrading(null)} />
    </div>
  );
}
