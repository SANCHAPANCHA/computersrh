import type { Metadata } from "next";
import { Credits } from "@/components/game/Bits";
import { GameOffline } from "@/components/game/GameOffline";
import { ShopGrid } from "@/components/game/ShopGrid";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { loadPlayer } from "@/lib/game/page";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage() {
  const { cfg, state, gameOnline } = await loadPlayer("/shop");
  const owned = Object.fromEntries((state?.inventory ?? []).map((i) => [i.componentId, { level: i.level, spare: i.spare }]));
  return (
    <div className="page-enter mx-auto flex max-w-6xl flex-col gap-6">
      <GameOffline online={gameOnline} />
      <RetroWindow title="SHOP.EXE" tag="RH" footerLeft="Buying a part you own adds a copy for upgrades" footerRight="Mythic parts: roulette only">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="kicker">✧ PARTS SHOP</div>
            <h1 className="h-display mt-2 text-4xl sm:text-5xl">SHOP</h1>
            <p className="mt-2 text-sm text-dim">Buy a part twice to unlock an upgrade. Fictional parts, game credits only.</p>
          </div>
          <div className="px-panel px-panel-gold border px-4 py-2 text-right">
            <div className="px-stat-label !text-gold">YOUR CREDITS</div>
            <Credits value={state?.credits ?? 0} className="text-2xl font-bold" />
          </div>
        </div>
        <ShopGrid credits={state?.credits ?? 0} owned={owned} installed={Object.values(state?.rig?.parts ?? {}) as string[]} cfg={{ shop: cfg.shop, upgrades: cfg.upgrades }} />
      </RetroWindow>
    </div>
  );
}
