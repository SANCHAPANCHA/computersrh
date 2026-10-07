import type { Metadata } from "next";
import { NewThreadForm } from "@/components/forum/NewThreadForm";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { EmptyState } from "@/components/ui/States";
import { getUserBuilds, getViewer } from "@/lib/db/queries";
import { X_STATUS_RE } from "@/lib/x-feed/types";
import { FORUM_CATEGORIES, type ForumCategory } from "@/types/forum";

export const metadata: Metadata = { title: "New topic" };

export default async function NewTopicPage({ searchParams }: PageProps<"/forum/new">) {
  const sp = await searchParams;
  const viewer = await getViewer();
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const xUrl = X_STATUS_RE.test(s("x")) ? s("x") : "";
  const c = s("c");
  const category: ForumCategory = xUrl ? "news" : (FORUM_CATEGORIES as readonly string[]).includes(c) ? (c as ForumCategory) : s("build") ? "builds" : "offtopic";
  const qs = new URLSearchParams(Object.entries({ x: xUrl, c, build: s("build") }).filter(([, v]) => v)).toString();

  return (
    <div className="page-enter mx-auto max-w-2xl">
      <RetroWindow title="NEW_TOPIC.TXT" footerLeft="Be kind · no spam · no impersonation">
        <h1 className="h-display mb-5 text-4xl">NEW TOPIC</h1>
        {viewer ? (
          <NewThreadForm
            initial={{ category, title: xUrl ? "New post from @ComputersRh" : "", body: "", xUrl, buildId: s("build") }}
            builds={(await getUserBuilds(viewer.id, 30)).filter((b) => b.isPublic).map((b) => ({ id: b.id, name: b.name, score: b.score }))}
          />
        ) : (
          <EmptyState title="LOG IN TO POST" message="Anyone can read. Create a free account to join the conversation." action={{ href: `/login?next=${encodeURIComponent(`/forum/new${qs ? `?${qs}` : ""}`)}`, label: "LOG IN" }} />
        )}
      </RetroWindow>
    </div>
  );
}
