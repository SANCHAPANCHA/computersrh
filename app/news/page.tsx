import type { Metadata } from "next";
import { XFeed } from "@/components/news/XFeed";
import { PixelButton } from "@/components/ui/PixelButton";
import { RetroWindow } from "@/components/ui/RetroWindow";

export const metadata: Metadata = { title: "X News", description: "Latest posts from @ComputersRh on X, live in RH PC LAB." };

export default function NewsPage() {
  return (
    <div className="page-enter mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="kicker">✧ FROM X</div>
          <h1 className="h-display mt-2 text-5xl text-cream sm:text-6xl">X NEWS</h1>
          <p className="mt-2 text-dim">Official updates from @ComputersRh. New posts appear here by themselves.</p>
        </div>
        <PixelButton href="/forum" variant="ghost">[ DISCUSS IN FORUM ]</PixelButton>
      </div>
      <RetroWindow title="X_NEWS.EXE" tag="𝕏" bodyClassName="p-4 sm:p-5" footerLeft="Latest posts · newest first" footerRight={<><span className="inline-block h-2 w-2 animate-blink bg-mint" /> LIVE</>}>
        <XFeed limit={30} />
      </RetroWindow>
    </div>
  );
}
