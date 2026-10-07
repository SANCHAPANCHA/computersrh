import type { Metadata } from "next";
import { OfflineNotice } from "@/components/community/OfflineNotice";
import { LiveRefresh } from "@/components/forum/LiveRefresh";
import { ThreadList } from "@/components/forum/ThreadList";
import { LiveChat } from "@/components/chat/LiveChat";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelTabs } from "@/components/ui/PixelTabs";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { EmptyState } from "@/components/ui/States";
import { getChatSanction, listChatMessages } from "@/lib/db/chat";
import { listThreads } from "@/lib/db/forum";
import { getViewer } from "@/lib/db/queries";
import { FORUM_CATEGORIES, FORUM_LABELS, type ForumCategory } from "@/types/forum";

export const metadata: Metadata = { title: "Forum", description: "Talk with the RH PC LAB community: topics, build help and a live chat room." };

export default async function ForumPage({ searchParams }: PageProps<"/forum">) {
  const raw = (await searchParams).c;
  const category = (FORUM_CATEGORIES as readonly string[]).includes(String(raw)) ? (raw as ForumCategory) : undefined;
  const [threads, messages, viewer] = await Promise.all([listThreads(category), listChatMessages(50), getViewer()]);
  const sanction = viewer ? await getChatSanction(viewer.id) : null;

  return (
    <div className="page-enter mx-auto flex max-w-6xl flex-col gap-6">
      <OfflineNotice />
      <LiveRefresh table="forum_threads" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="kicker">✧ HANG OUT</div>
          <h1 className="h-display mt-2 text-5xl text-cream sm:text-6xl">FORUM</h1>
          <p className="mt-2 text-dim">Topics, build help and a live chat room.</p>
        </div>
        <PixelButton href={category ? `/forum/new?c=${category}` : "/forum/new"} variant="mint">[ NEW TOPIC ]</PixelButton>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <RetroWindow title="FORUM.EXE" bodyClassName="p-4 sm:p-5" footerLeft={`${threads.length} topics`} footerRight={<><span className="inline-block h-2 w-2 animate-blink bg-mint" /> LIVE</>}>
          <PixelTabs
            label="Filter topics"
            className="mb-4"
            tabs={[{ href: "/forum", label: "ALL", active: !category }, ...FORUM_CATEGORIES.map((c) => ({ href: `/forum?c=${c}`, label: FORUM_LABELS[c], active: category === c }))]}
          />
          {threads.length ? (
            <ThreadList threads={threads} />
          ) : (
            <EmptyState title="NO TOPICS YET" message="Be the first to start a conversation." action={{ href: "/forum/new", label: "NEW TOPIC" }} />
          )}
        </RetroWindow>

        <LiveChat initial={messages} initialSanction={sanction} />
      </div>
    </div>
  );
}
