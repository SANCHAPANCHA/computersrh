import type { Metadata } from "next";
import { Credits } from "@/components/game/Bits";
import { GameOffline } from "@/components/game/GameOffline";
import { RigOverview } from "@/components/game/RigOverview";
import { WelcomeWindow } from "@/components/game/WelcomeWindow";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { loadPlayer } from "@/lib/game/page";
import { evaluateRig } from "@/lib/game/rig";

export const metadata: Metadata = { title: "My PC" };

export default async function MyPcPage() {
  const { viewer, cfg, state, gameOnline } = await loadPlayer("/pc");
  const credits = state?.credits ?? 0;
  const upgradable = state?.inventory.filter((i) => i.spare > 0 && i.level < cfg.upgrades.maxLevel).length ?? 0;

  return (
    <div className="page-enter mx-auto flex max-w-6xl flex-col gap-6">
      <GameOffline online={gameOnline} />
      {!state?.rig ? (
        <WelcomeWindow credits={credits || cfg.startingCredits} />
      ) : (
        <RetroWindow
          title="MY_PC.EXE"
          tag="RH"
          footerLeft={`@${viewer.username}'s rig`}
          footerRight={<>UPDATED {new Date(state.rig.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</>}
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="kicker">✧ YOUR MAIN RIG</div>
              <h1 className="h-display mt-2 text-4xl sm:text-5xl">MY PC</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Credits value={credits} className="text-xl font-bold" />
              <PixelButton href="/builder?mode=rig" variant="mint"><PixelIcon name="wrench" size={12} /> UPGRADE PC</PixelButton>
              <PixelButton href="/battles"><PixelIcon name="swords" size={12} /> BATTLE</PixelButton>
            </div>
          </div>
          <RigOverview ev={evaluateRig(state.rig.parts, state.levels, cfg)} inventory={state.inventory} />
          {upgradable ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-mint/70 bg-mint/10 px-4 py-3">
              <span className="font-bold text-mint">DUPLICATE FOUND · {upgradable} UPGRADE{upgradable > 1 ? "S" : ""} AVAILABLE</span>
              <PixelButton href="/inventory?f=upgrades" variant="mint" size="sm"><PixelIcon name="up" size={10} /> UPGRADE PARTS</PixelButton>
            </div>
          ) : null}
        </RetroWindow>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: "/shop", icon: "cart", title: "SHOP", text: "Buy new parts, or a second copy to upgrade one." },
          { href: "/daily", icon: "gift", title: "DAILY", text: "Check in for credits and spin the free roulette." },
          { href: "/inventory", icon: "floppy", title: "INVENTORY", text: "Fuse duplicates to level parts up to LV5." },
        ].map((c) => (
          <a key={c.href} href={c.href} className="px-card px-card-hover flex items-start gap-3 p-4">
            <PixelIcon name={c.icon} size={22} className="mt-1 text-lilac" />
            <span>
              <span className="block font-bold tracking-wide">{c.title}</span>
              <span className="block text-sm text-dim">{c.text}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
