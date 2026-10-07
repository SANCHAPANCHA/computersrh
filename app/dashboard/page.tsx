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
import { Credits } from "@/components/game/Bits";
import { CheckInPanel } from "@/components/game/CheckInPanel";
import { GameOffline } from "@/components/game/GameOffline";
import { PcLevelBar } from "@/components/game/RigOverview";
import { WelcomeWindow } from "@/components/game/WelcomeWindow";
import { PcVisualizer } from "@/components/pc/PcVisualizer";
import { RarityBadge } from "@/components/ui/PixelBadge";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { getGameConfig } from "@/lib/game/config";
import { getPlayerState } from "@/lib/game/queries";
import { evaluateRig } from "@/lib/game/rig";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { cn, timeAgo } from "@/lib/utils";

const TX_LABELS: Record<string, string> = {
  starting: "Starting balance",
  checkin: "Daily check-in",
  roulette: "Roulette win",
  purchase: "Part purchase",
  battle: "Battle reward",
  challenge: "Challenge reward",
  adjustment: "Adjustment",
};

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/dashboard");
  const cfg = await getGameConfig();
  const [builds, unlocked, challenge, game] = await Promise.all([getUserBuilds(viewer.id), getUnlockedAchievements(viewer.id), getTodayChallenge(), getPlayerState(viewer.id, cfg)]);
  const rigEv = game?.rig ? evaluateRig(game.rig.parts, game.levels, cfg) : null;
  const battlesLeft = Math.max(0, cfg.battle.rewardedPerDay - (game?.battle.rewardedToday ?? 0));
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
            <h1 className="h-display mt-1 text-3xl sm:text-5xl">
              WELCOME BACK,
              <span className="block text-mint [overflow-wrap:anywhere]">@{viewer.username}</span>
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <PixelButton href="/builder" variant="ghost">[ SANDBOX BUILDER ]</PixelButton>
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

      <GameOffline online={Boolean(getAdminSupabase())} />
      {game?.isNew ? (
        <WelcomeWindow credits={game.credits || cfg.startingCredits} />
      ) : game ? (
        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <RetroWindow title="MY_PC.EXE" tag="RH" footerRight={<a href="/pc" className="hover:underline">Open my PC →</a>}>
            <div className="grid gap-4 sm:grid-cols-[1.1fr_1fr]">
              <div className="flex flex-col gap-3">
                <h2 className="text-2xl font-bold tracking-wide">MY PC</h2>
                {rigEv ? (
                  <div className="relative border border-line bg-navy-950">
                    <PcVisualizer parts={rigEv.summary.parts} rgb="violet" animated label="Your PC" />
                    <span className="absolute left-2 top-2"><RarityBadge rarity={rigEv.summary.rarity} solid /></span>
                  </div>
                ) : (
                  <EmptyState title="NO PC INSTALLED" message="Spend your credits on your first rig." action={{ href: "/builder?mode=rig", label: "BUILD YOUR FIRST PC" }} />
                )}
                {rigEv ? <PcLevelBar ev={rigEv} /> : null}
              </div>
              <div className="grid content-start grid-cols-2 gap-2">
                <div className="px-panel px-panel-accent col-span-2 px-3 py-2.5">
                  <div className="px-stat-label">PC SCORE</div>
                  <div className="text-4xl font-bold leading-none text-mint">{rigEv?.summary.score.total ?? "—"}</div>
                </div>
                <div className="px-panel col-span-2 px-3 py-2.5">
                  <div className="px-stat-label">CREDITS</div>
                  <Credits value={game.credits} className="text-2xl font-bold" />
                </div>
                <a href="/daily" className="px-panel px-3 py-2.5 hover:border-line-strong">
                  <div className="px-stat-label">CHECK-IN</div>
                  <div className={cn("text-lg font-bold", game.checkin.doneToday ? "text-dim" : "text-gold")}>{game.checkin.doneToday ? "DONE ✓" : `+${game.checkin.nextReward}`}</div>
                </a>
                <a href="/daily" className="px-panel px-3 py-2.5 hover:border-line-strong">
                  <div className="px-stat-label">ROULETTE</div>
                  <div className={cn("text-sm font-bold leading-tight", game.spin.doneToday ? "text-dim" : "text-mint")}>{game.spin.doneToday ? "SPUN TODAY" : "FREE SPIN AVAILABLE"}</div>
                </a>
                <a href="/battles" className="px-panel col-span-2 px-3 py-2.5 hover:border-line-strong">
                  <div className="px-stat-label">BATTLES</div>
                  <div className="text-lg font-bold text-lilac">{rigEv ? "READY" : "BUILD A PC FIRST"} <span className="text-xs font-normal text-dim">· {battlesLeft} rewarded left today · {game.battle.wins}W/{game.battle.losses}L</span></div>
                </a>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <PixelButton href="/daily" variant="mint"><PixelIcon name="gift" size={12} /> CHECK IN</PixelButton>
              <PixelButton href="/builder?mode=rig"><PixelIcon name="up" size={12} /> UPGRADE PC</PixelButton>
              <PixelButton href="/battles"><PixelIcon name="swords" size={12} /> BATTLE</PixelButton>
            </div>
          </RetroWindow>
          <div className="flex flex-col gap-6">
            <RetroWindow title="CHECK_IN.EXE" bodyClassName="p-4" footerLeft={game.checkin.doneToday ? `Streak day ${game.checkin.streak}` : "Daily reward"}>
              <CheckInPanel compact rewards={cfg.checkinRewards} doneToday={game.checkin.doneToday} streakDay={game.checkin.doneToday ? game.checkin.streak : game.checkin.nextStreak} todayReward={game.checkin.todayReward} />
            </RetroWindow>
            <RetroWindow title="TRANSACTIONS.LOG" bodyClassName="p-4" footerLeft="Every credit movement is recorded">
              <h2 className="mb-2 text-lg font-bold tracking-wide">TRANSACTION HISTORY</h2>
              <ul className="divide-y divide-dashed divide-line text-sm">
                {game.transactions.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 py-1.5">
                    <span className={cn("w-20 text-right font-bold tabular-nums", t.amount >= 0 ? "text-mint" : "text-red")}>{t.amount >= 0 ? "+" : ""}{t.amount.toLocaleString("en-US")}</span>
                    <span className="min-w-0 flex-1 truncate">{TX_LABELS[t.kind] ?? t.kind}</span>
                    <span className="text-xs text-faint">{timeAgo(t.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </RetroWindow>
          </div>
        </div>
      ) : null}

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
