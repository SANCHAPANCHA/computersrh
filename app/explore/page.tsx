import type { Metadata } from "next";
import { OfflineNotice } from "@/components/community/OfflineNotice";
import { BuildCard } from "@/components/pc/BuildCard";
import { PresetCard } from "@/components/pc/PresetCard";
import { PixelTabs } from "@/components/ui/PixelTabs";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { EmptyState } from "@/components/ui/States";
import { PRESETS } from "@/data/presets";
import { listBuilds, type ExploreTab } from "@/lib/db/queries";

export const metadata: Metadata = { title: "Community builds", description: "Explore rigs built by the RH PC LAB community." };

const TABS: { key: ExploreTab; label: string }[] = [
  { key: "newest", label: "NEWEST" },
  { key: "top", label: "TOP SCORE" },
  { key: "liked", label: "MOST LIKED" },
  { key: "legendary", label: "LEGENDARY" },
];

export default async function ExplorePage({ searchParams }: PageProps<"/explore">) {
  const raw = (await searchParams).tab;
  const tab = TABS.find((t) => t.key === raw)?.key ?? "newest";
  const builds = await listBuilds(tab, 36);

  return (
    <div className="page-enter mx-auto flex max-w-6xl flex-col gap-6">
      <OfflineNotice />
      <RetroWindow title="EXPLORE.EXE" footerLeft={`${builds.length} rigs loaded`} footerRight="Click a rig to open it">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="kicker">✧ EXPLORE</div>
            <h1 className="h-display mt-2 text-4xl sm:text-5xl">COMMUNITY BUILDS</h1>
          </div>
          <PixelTabs label="Sort builds" tabs={TABS.map((t) => ({ href: t.key === "newest" ? "/explore" : `/explore?tab=${t.key}`, label: t.label, active: t.key === tab }))} />
        </div>
        <div className="mt-6">
          {builds.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {builds.map((b, i) => (
                <BuildCard key={b.id} build={b} rank={tab === "newest" ? undefined : i + 1} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <EmptyState title="NO RIGS FOUND" message={tab === "legendary" ? "No Legendary rigs yet. Could yours be the first?" : "Be the first one to boot a PC."} action={{ href: "/builder", label: "BUILD YOUR PC" }} />
              <div>
                <div className="kicker mb-3">✧ OR START FROM A LAB PRESET</div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {PRESETS.map((p) => <PresetCard key={p.key} preset={p} />)}
                </div>
              </div>
            </div>
          )}
        </div>
      </RetroWindow>
    </div>
  );
}
