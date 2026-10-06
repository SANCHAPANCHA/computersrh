import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AchievementGrid } from "@/components/community/AchievementGrid";
import { ChallengeCard } from "@/components/community/ChallengeCard";
import { BuildCard } from "@/components/pc/BuildCard";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { StatBox } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { EmptyState } from "@/components/ui/States";
import { getTodayChallenge, getUnlockedAchievements, getUserBuilds, getViewer } from "@/lib/db/queries";
import { builderTitle } from "@/lib/titles";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/dashboard");
  const [builds, unlocked, challenge] = await Promise.all([getUserBuilds(viewer.id), getUnlockedAchievements(viewer.id), getTodayChallenge()]);
  const latest = builds[0];
  const best = [...builds].sort((a, b) => b.score - a.score)[0];
  const likes = builds.reduce((s, b) => s + b.likes, 0);

  return (
    <div className="page-enter mx-auto flex max-w-6xl flex-col gap-6">
      <RetroWindow title="DASHBOARD.EXE" footerLeft={builderTitle(best?.score ?? 0, builds.length)}>
        <div className="flex flex-wrap items-center gap-5">
          <PixelAvatar id={viewer.avatar} size={72} />
          <div className="flex-1">
            <div className="kicker">✧ {builderTitle(best?.score ?? 0, builds.length)}</div>
            <h1 className="h-display mt-1 text-3xl break-all sm:text-5xl">WELCOME BACK, <span className="text-mint">@{viewer.username}</span></h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <PixelButton href="/builder" variant="mint">[ BUILD NEW PC ]</PixelButton>
            <PixelButton href={`/u/${viewer.username}`}>[ VIEW PROFILE ]</PixelButton>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox label="BUILDS" value={builds.length} />
          <StatBox label="BEST SCORE" value={best?.score ?? "—"} accent="mint" />
          <StatBox label="LIKES" value={likes} accent="pink" />
          <StatBox label="ACHIEVEMENTS" value={`${Object.keys(unlocked).length}/8`} accent="gold" />
        </div>
      </RetroWindow>

      {builds.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          <RetroWindow title="LATEST_BUILD.SAV" bodyClassName="p-4">
            <h2 className="mb-3 text-xl font-bold">LATEST BUILD</h2>
            <BuildCard build={latest} />
          </RetroWindow>
          <RetroWindow title="BEST_BUILD.SAV" bodyClassName="p-4">
            <h2 className="mb-3 text-xl font-bold">BEST BUILD</h2>
            <BuildCard build={best} />
          </RetroWindow>
        </div>
      ) : (
        <RetroWindow title="RIGS.DIR">
          <EmptyState title="NO RIGS FOUND" message="Be the first one to boot a PC." action={{ href: "/builder", label: "BUILD YOUR PC" }} />
        </RetroWindow>
      )}

      {builds.length > 1 ? (
        <RetroWindow title="RECENT_BUILDS.DIR" footerLeft={`${builds.length} total`}>
          <h2 className="mb-4 text-2xl font-bold">RECENT BUILDS</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {builds.slice(0, 6).map((b) => <BuildCard key={b.id} build={b} />)}
          </div>
        </RetroWindow>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <RetroWindow title="ACHIEVEMENTS.DAT" footerRight={<a href="/achievements" className="hover:underline">All →</a>}>
          <h2 className="mb-4 text-2xl font-bold">ACHIEVEMENTS</h2>
          {Object.keys(unlocked).length ? null : <p className="mb-3 text-sm text-dim">NO ACHIEVEMENTS YET — Start building.</p>}
          <AchievementGrid unlocked={unlocked} compact />
        </RetroWindow>
        <RetroWindow title="DAILY_CHALLENGE.EXE" footerRight={<a href="/challenges" className="hover:underline">Enter →</a>}>
          <ChallengeCard challenge={challenge} />
        </RetroWindow>
      </div>
    </div>
  );
}
