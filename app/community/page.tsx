import type { Metadata } from "next";
import { OfflineNotice } from "@/components/community/OfflineNotice";
import { LiveRefresh } from "@/components/forum/LiveRefresh";
import { ThreadList } from "@/components/forum/ThreadList";
import { XFeed } from "@/components/news/XFeed";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelTabs } from "@/components/ui/PixelTabs";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { EmptyState } from "@/components/ui/States";
import { listThreads } from "@/lib/db/forum";
import { FORUM_CATEGORIES, FORUM_LABELS, type ForumCategory } from "@/types/forum";

export const metadata: Metadata = { title: "Community", description: "Chat with the RH PC LAB community and follow news from @ComputersRh." };

export default async function CommunityPage({ searchParams }: PageProps<"/community">) {
  const raw = (await searchParams).c;
  const category = (FORUM_CATEGORIES as readonly string[]).includes(String(raw)) ? (raw as ForumCategory) : undefined;
  const threads = await listThreads(category);

  return (
    <div className="page-enter mx-auto flex max-w-6xl flex-col gap-6">
      <OfflineNotice />
      <LiveRefresh table="forum_threads" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="kicker">✧ HANG OUT</div>
          <h1 className="h-display mt-2 text-5xl text-cream sm:text-6xl">COMMUNITY</h1>
          <p className="mt-2 text-dim">Discuss news, share rigs and ask for build help.</p>
        </div>
        <PixelButton href={category ? `/community/new?c=${category}` : "/community/new"} variant="mint">[ NEW TOPIC ]</PixelButton>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <RetroWindow title="BOARD.EXE" bodyClassName="p-4 sm:p-5" footerLeft={`${threads.length} topics`} footerRight={<><span className="inline-block h-2 w-2 animate-blink bg-mint" /> LIVE</>}>
          <PixelTabs
            label="Filter topics"
            className="mb-4"
            tabs={[{ href: "/community", label: "ALL", active: !category }, ...FORUM_CATEGORIES.map((c) => ({ href: `/community?c=${c}`, label: FORUM_LABELS[c], active: category === c }))]}
          />
          {threads.length ? (
            <ThreadList threads={threads} />
          ) : (
            <EmptyState title="NO TOPICS YET" message="Be the first to start a conversation." action={{ href: "/community/new", label: "NEW TOPIC" }} />
          )}
        </RetroWindow>

        <RetroWindow title="NEWS_FEED.EXE" tag="𝕏" bodyClassName="p-4" footerLeft="Mirrored from @ComputersRh on X">
          <h2 className="mb-3 text-2xl font-bold tracking-wide">LIVE FROM @COMPUTERSRH</h2>
          <XFeed limit={8} compact />
        </RetroWindow>
      </div>
    </div>
  );
}
