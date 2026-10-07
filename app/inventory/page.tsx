import type { Metadata } from "next";
import { GameOffline } from "@/components/game/GameOffline";
import { InventoryGrid } from "@/components/game/InventoryGrid";
import { PixelButton } from "@/components/ui/PixelButton";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { loadPlayer } from "@/lib/game/page";

export const metadata: Metadata = { title: "Inventory" };

export default async function InventoryPage({ searchParams }: PageProps<"/inventory">) {
  const f = (await searchParams).f;
  const { cfg, state, gameOnline } = await loadPlayer("/inventory");
  const items = state?.inventory ?? [];
  return (
    <div className="page-enter mx-auto flex max-w-6xl flex-col gap-6">
      <GameOffline online={gameOnline} />
      <RetroWindow title="INVENTORY.DAT" footerLeft={`${items.length} parts · ${items.reduce((s, i) => s + i.spare, 0)} spare copies`} footerRight={`Max level ${cfg.upgrades.maxLevel}`}>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="kicker">✧ YOUR PARTS</div>
            <h1 className="h-display mt-2 text-4xl sm:text-5xl">INVENTORY</h1>
            <p className="mt-2 text-sm text-dim">Got a duplicate? Fuse it to level the part up: higher performance, more score.</p>
          </div>
          <div className="flex gap-2">
            <PixelButton href="/shop" size="sm">SHOP</PixelButton>
            <PixelButton href="/builder?mode=rig" variant="mint" size="sm">UPGRADE PC</PixelButton>
          </div>
        </div>
        <InventoryGrid
          items={items}
          installed={Object.values(state?.rig?.parts ?? {}) as string[]}
          hasRig={Boolean(state?.rig)}
          upgrades={cfg.upgrades}
          initialFilter={f === "upgrades" ? "upgrades" : f === "installed" ? "installed" : "all"}
        />
      </RetroWindow>
    </div>
  );
}
