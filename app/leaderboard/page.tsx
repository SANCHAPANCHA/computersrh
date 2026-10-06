import type { Metadata } from "next";
import { LeaderboardList } from "@/components/community/LeaderboardList";
import { OfflineNotice } from "@/components/community/OfflineNotice";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { EmptyState } from "@/components/ui/States";
import { getLeaderboard } from "@/lib/db/queries";

export const metadata: Metadata = { title: "Leaderboard", description: "Top builders in RH PC LAB." };

export default async function LeaderboardPage() {
  const [score, builds, likes] = await Promise.all([getLeaderboard("score"), getLeaderboard("builds"), getLeaderboard("likes")]);
  const boards = [
    { title: "TOP SCORE", file: "TOP_SCORE.DAT", rows: score, metric: "bestScore" as const, unit: "" },
    { title: "MOST BUILDS", file: "MOST_BUILDS.DAT", rows: builds, metric: "buildsCount" as const, unit: "rigs" },
    { title: "MOST LIKED", file: "MOST_LIKED.DAT", rows: likes, metric: "totalLikes" as const, unit: "♥" },
  ];
  return (
    <div className="page-enter mx-auto flex max-w-6xl flex-col gap-6">
      <OfflineNotice />
      <div>
        <div className="kicker">✧ HALL OF RIGS</div>
        <h1 className="h-display mt-2 text-5xl text-cream sm:text-6xl">LEADERBOARD</h1>
        <p className="mt-2 text-dim">Ranked from public builds. Updated live.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {boards.map((b) => (
          <RetroWindow key={b.title} title={b.file} bodyClassName="p-4" footerLeft={`Top ${b.rows.length}`}>
            <h2 className="mb-3 text-2xl font-bold tracking-wide">{b.title}</h2>
            {b.rows.length ? <LeaderboardList rows={b.rows} metric={b.metric} unit={b.unit} /> : <EmptyState title="NO RIGS FOUND" message="Be the first one to boot a PC." action={{ href: "/builder", label: "BUILD YOUR PC" }} />}
          </RetroWindow>
        ))}
      </div>
    </div>
  );
}
