import type { Metadata } from "next";
import { Credits } from "@/components/game/Bits";
import { CheckInPanel } from "@/components/game/CheckInPanel";
import { GameOffline } from "@/components/game/GameOffline";
import { Roulette } from "@/components/game/Roulette";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { loadPlayer } from "@/lib/game/page";
import { rouletteOdds } from "@/lib/game/roulette";

export const metadata: Metadata = { title: "Daily" };

export default async function DailyPage() {
  const { cfg, state, gameOnline } = await loadPlayer("/daily");
  const c = state?.checkin;
  return (
    <div className="page-enter mx-auto flex max-w-6xl flex-col gap-6">
      <GameOffline online={gameOnline} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="kicker">✧ COME BACK EVERY DAY</div>
          <h1 className="h-display mt-2 text-5xl text-cream sm:text-6xl">DAILY</h1>
          <p className="mt-2 text-dim">Free credits and a free spin every day. Resets at 00:00 UTC.</p>
        </div>
        <div className="px-panel px-panel-gold border px-4 py-2 text-right">
          <div className="px-stat-label !text-gold">YOUR CREDITS</div>
          <Credits value={state?.credits ?? 0} className="text-2xl font-bold" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <RetroWindow title="CHECK_IN.EXE" tag="RH" footerLeft={c?.doneToday ? `Streak day ${c.streak}` : c?.streak ? `Current streak: ${c.streak} day${c.streak > 1 ? "s" : ""}` : "Start a streak today"}>
          <h2 className="mb-4 text-2xl font-bold tracking-wide">DAILY CHECK-IN</h2>
          <CheckInPanel rewards={cfg.checkinRewards} doneToday={Boolean(c?.doneToday)} streakDay={c?.doneToday ? c.streak : (c?.nextStreak ?? 1)} todayReward={c?.todayReward ?? null} />
        </RetroWindow>
        <RetroWindow title="ROULETTE.EXE" tag="RH" footerLeft="1 free spin per day" footerRight="Results are rolled on the server">
          <h2 className="mb-4 text-2xl font-bold tracking-wide">DAILY ROULETTE</h2>
          <Roulette slots={rouletteOdds(cfg)} doneToday={Boolean(state?.spin.doneToday)} todayReward={state?.spin.reward ?? null} />
        </RetroWindow>
      </div>
    </div>
  );
}
