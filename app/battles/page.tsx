import type { Metadata } from "next";
import { BattleArena } from "@/components/game/BattleArena";
import { Credits, GameStat } from "@/components/game/Bits";
import { GameOffline } from "@/components/game/GameOffline";
import { PcVisualizer } from "@/components/pc/PcVisualizer";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { RarityBadge } from "@/components/ui/PixelBadge";
import { PixelButton } from "@/components/ui/PixelButton";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { EmptyState } from "@/components/ui/States";
import { BATTLE_LABELS, BATTLE_STATS } from "@/lib/game/battle";
import { loadPlayer } from "@/lib/game/page";
import { getBattleHistory } from "@/lib/game/queries";
import { evaluateRig } from "@/lib/game/rig";
import { cn, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "PC Battles" };

export default async function BattlesPage() {
  const { viewer, cfg, state, gameOnline } = await loadPlayer("/battles");
  const history = await getBattleHistory(viewer.id);
  const ev = state?.rig ? evaluateRig(state.rig.parts, state.levels, cfg) : null;
  const b = state?.battle;
  const left = Math.max(0, cfg.battle.rewardedPerDay - (b?.rewardedToday ?? 0));

  return (
    <div className="page-enter mx-auto flex max-w-6xl flex-col gap-6">
      <GameOffline online={gameOnline} />
      <div>
        <div className="kicker">✧ ARENA</div>
        <h1 className="h-display mt-2 text-5xl text-cream sm:text-6xl">PC BATTLES</h1>
        <p className="mt-2 text-dim">Your rig vs a rival with a similar PC score. Win credits, battle points and streak bonuses.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <GameStat label="WINS" value={b?.wins ?? 0} accent="mint" />
        <GameStat label="LOSSES" value={b?.losses ?? 0} accent="pink" />
        <GameStat label="WIN STREAK" value={b?.streak ?? 0} sub={`BEST ${b?.bestStreak ?? 0}`} accent="gold" />
        <GameStat label="BATTLE POINTS" value={b?.points ?? 0} accent="lilac" />
        <GameStat label="REWARDED TODAY" value={`${left}/${cfg.battle.rewardedPerDay}`} sub="battles with credit rewards left" className="col-span-2 sm:col-span-1" />
      </div>

      {!ev ? (
        <RetroWindow title="ARENA.EXE">
          <EmptyState title="NO PC TO FIGHT WITH" message="Build your first PC, then come back to battle." action={{ href: "/builder?mode=rig", label: "BUILD YOUR FIRST PC" }} />
        </RetroWindow>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.35fr]">
          <RetroWindow title="MY_FIGHTER.SYS" footerLeft={`Matchmaking window ±${cfg.battle.windows[0]} score`}>
            <div className="flex items-center gap-3">
              <PixelAvatar id={viewer.avatar} size={40} />
              <div className="flex-1">
                <div className="font-bold">@{viewer.username}</div>
                <div className="text-xs text-dim">PC LEVEL {ev.pcLevel} · {ev.pcLevelName}</div>
              </div>
              <RarityBadge rarity={ev.summary.rarity} solid />
            </div>
            <div className="mt-3 border border-line bg-navy-950">
              <PcVisualizer parts={ev.summary.parts} rgb="violet" animated label="Your PC" />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="col-span-2 flex justify-between border-b border-line pb-1"><dt className="px-stat-label">PC SCORE</dt><dd className="text-xl font-bold text-mint">{ev.summary.score.total}</dd></div>
              {BATTLE_STATS.map((s) => (
                <div key={s} className="flex justify-between border-b border-dashed border-line py-0.5">
                  <dt className="text-dim">{BATTLE_LABELS[s]}</dt>
                  <dd className="font-bold tabular-nums">{ev.stats[s]}</dd>
                </div>
              ))}
            </dl>
            <PixelButton href="/builder?mode=rig" size="sm" className="mt-4 w-full">UPGRADE PC</PixelButton>
          </RetroWindow>
          <RetroWindow title="ARENA.EXE" tag="RH" footerLeft={`Win +${cfg.battle.winCredits} CR · Loss +${cfg.battle.lossCredits} CR`} footerRight="Streak bonus at 3 / 5 / 10 wins">
            <BattleArena myName={`@${viewer.username}`} myAvatar={viewer.avatar} myScore={ev.summary.score.total} upgrades={cfg.upgrades} cooldownSeconds={cfg.battle.cooldownSeconds} />
          </RetroWindow>
        </div>
      )}

      <RetroWindow title="BATTLE_HISTORY.LOG" footerLeft={`${history.length} recent battles`}>
        <h2 className="mb-3 text-2xl font-bold tracking-wide">BATTLE HISTORY</h2>
        {history.length ? (
          <ul className="divide-y divide-dashed divide-line border border-line">
            {history.map((h) => (
              <li key={h.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2.5 sm:grid-cols-[auto_1fr_auto_auto_auto]">
                <span className={cn("w-16 text-center font-label text-[0.6rem] tracking-widest", h.won ? "bg-mint text-navy-900" : "bg-red text-cream")}>{h.won ? "WIN" : "LOSS"}</span>
                <span className="flex min-w-0 items-center gap-2">
                  <PixelAvatar id={h.opponentAvatar} size={22} />
                  <span className="truncate">vs {h.opponentName}</span>
                </span>
                <span className="text-right tabular-nums">{h.myScore} <span className="text-dim">vs</span> {h.oppScore}</span>
                <span className="hidden text-right sm:block">{h.credits ? <Credits value={h.credits} sign className="text-sm" /> : <span className="text-xs text-faint">no reward</span>}</span>
                <span className="hidden text-right text-xs text-faint sm:block">{timeAgo(h.createdAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="NO BATTLES YET" message="Your first fight is one click away." />
        )}
      </RetroWindow>
    </div>
  );
}
