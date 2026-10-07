import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryBadge } from "@/components/forum/CategoryBadge";
import { DeleteButton } from "@/components/forum/DeleteButton";
import { LiveRefresh } from "@/components/forum/LiveRefresh";
import { ReplyForm } from "@/components/forum/ReplyForm";
import { XGlyph, XPostCard } from "@/components/news/XPostCard";
import { BuildCard } from "@/components/pc/BuildCard";
import { Linkify } from "@/components/ui/Linkify";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { EmptyState } from "@/components/ui/States";
import { getThread } from "@/lib/db/forum";
import { getBuild, getViewer } from "@/lib/db/queries";
import { cn, timeAgo } from "@/lib/utils";
import { getStoredXPost } from "@/lib/x-feed/feed";
import { X_STATUS_RE } from "@/lib/x-feed/types";

export async function generateMetadata({ params }: PageProps<"/forum/[id]">): Promise<Metadata> {
  const t = await getThread((await params).id);
  return { title: t ? t.thread.title : "Topic not found" };
}

export default async function TopicPage({ params }: PageProps<"/forum/[id]">) {
  const { id } = await params;
  const [data, viewer] = await Promise.all([getThread(id), getViewer()]);
  if (!data) notFound();
  const { thread, replies } = data;
  const xId = thread.xUrl?.match(X_STATUS_RE)?.[2];
  const [xPost, build] = await Promise.all([xId ? getStoredXPost(xId) : null, thread.buildId ? getBuild(thread.buildId) : null]);

  return (
    <div className="page-enter mx-auto flex max-w-3xl flex-col gap-6">
      <LiveRefresh table="forum_replies" filter={`thread_id=eq.${thread.id}`} />
      <Link href="/forum" className="text-sm text-dim hover:text-mint">← Back to forum</Link>

      <RetroWindow title="TOPIC.TXT" footerLeft={`${thread.replyCount} replies`} footerRight={<><span className="inline-block h-2 w-2 animate-blink bg-mint" /> LIVE</>}>
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={thread.category} />
          <span className="text-xs text-faint">{timeAgo(thread.createdAt)}</span>
        </div>
        <h1 className="h-display mt-3 text-3xl break-words sm:text-4xl">{thread.title}</h1>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <PixelAvatar id={thread.author.avatar} size={24} />
          {thread.author.id ? <Link href={`/u/${thread.author.username}`} className="text-mint hover:underline">@{thread.author.username}</Link> : <span className="text-dim">@deleted</span>}
          {viewer?.id === thread.author.id ? <span className="ml-auto"><DeleteButton kind="thread" id={thread.id} threadId={thread.id} /></span> : null}
        </div>
        <p className="read mt-4 whitespace-pre-line break-words text-sm text-ink/95">
          <Linkify text={thread.body} />
        </p>
        {xPost ? (
          <div className="mt-5"><XPostCard post={xPost} discuss={false} /></div>
        ) : thread.xUrl ? (
          <a href={thread.xUrl} target="_blank" rel="noopener noreferrer nofollow" className="px-panel mt-5 flex items-center gap-3 p-3 hover:border-line-strong">
            <XGlyph className="h-5 w-5" />
            <span className="min-w-0 flex-1 truncate text-sm text-dim">{thread.xUrl.replace("https://", "")}</span>
            <span className="text-xs text-mint">OPEN ↗</span>
          </a>
        ) : null}
        {build ? <div className="mt-5 max-w-sm"><BuildCard build={build} /></div> : null}
      </RetroWindow>

      <RetroWindow title="REPLIES.LOG" bodyClassName="p-4 sm:p-5" footerLeft="Messages update live">
        <h2 className="mb-4 text-xl font-bold tracking-wide">REPLIES</h2>
        {replies.length ? (
          <ol className="flex flex-col gap-3">
            {replies.map((r) => {
              const mine = viewer?.id === r.author.id;
              return (
                <li key={r.id} className={cn("flex gap-2.5", mine && "flex-row-reverse")}>
                  <PixelAvatar id={r.author.avatar} size={30} className="mt-1" />
                  <div className={cn("max-w-[85%] border px-3 py-2", mine ? "border-mint/60 bg-mint/10" : "border-line bg-navy-950/70")}>
                    <div className="flex items-center gap-2 text-xs">
                      {r.author.id ? <Link href={`/u/${r.author.username}`} className={mine ? "text-mint" : "text-lilac"}>@{r.author.username}</Link> : <span className="text-dim">@deleted</span>}
                      <time dateTime={r.createdAt} className="text-faint">{timeAgo(r.createdAt)}</time>
                      {mine ? <DeleteButton kind="reply" id={r.id} threadId={thread.id} /> : null}
                    </div>
                    <p className="read mt-1 whitespace-pre-line break-words text-sm"><Linkify text={r.body} /></p>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mb-2 text-sm text-dim">No replies yet. Start the conversation!</p>
        )}
        <div className="px-divider mt-5 pt-4">
          {viewer ? <ReplyForm threadId={thread.id} /> : <EmptyState title="LOG IN TO REPLY" message="Create a free account to chat with the lab." action={{ href: `/login?next=/forum/${thread.id}`, label: "LOG IN" }} />}
        </div>
      </RetroWindow>
    </div>
  );
}
