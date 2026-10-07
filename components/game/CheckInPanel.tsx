"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Countdown } from "@/components/ui/Countdown";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { useToast } from "@/components/ui/PixelToast";
import { checkIn } from "@/lib/game/actions";
import { play } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { Credits } from "./Bits";

interface Props {
  rewards: number[];
  doneToday: boolean;
  /** Today's streak day if done, otherwise the streak day you'd reach now. */
  streakDay: number;
  todayReward: number | null;
  compact?: boolean;
}

export function CheckInPanel({ rewards, doneToday, streakDay, todayReward, compact }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ reward: number; streak: number } | null>(doneToday && todayReward ? { reward: todayReward, streak: streakDay } : null);
  const done = doneToday || Boolean(result);
  const day = result?.streak ?? streakDay;
  const pos = ((day - 1) % rewards.length) + 1;

  async function go() {
    setBusy(true);
    const res = await checkIn();
    setBusy(false);
    if (!res.ok) {
      play("error");
      return toast({ tone: "error", title: "CHECK-IN FAILED", message: res.error });
    }
    play("success");
    setResult({ reward: res.reward, streak: res.streak });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <ol className={cn("grid gap-1.5", compact ? "grid-cols-7" : "grid-cols-4 sm:grid-cols-7")} aria-label="Check-in streak rewards">
        {rewards.map((r, i) => {
          const n = i + 1;
          const claimed = done ? n <= pos : n < pos;
          const isNext = !done && n === pos;
          const isToday = done && n === pos;
          return (
            <li
              key={n}
              className={cn(
                "relative flex flex-col items-center gap-1 border px-1 py-2 text-center",
                isNext ? "border-mint bg-mint/10" : isToday ? "border-gold bg-gold/15" : claimed ? "border-line-strong bg-navy-700/60" : "border-line bg-navy-950",
                n === rewards.length && "col-span-1",
              )}
            >
              <span className="font-label text-[0.55rem] tracking-widest text-dim">DAY {n}</span>
              <PixelIcon name={n === rewards.length ? "gem" : "coin"} size={compact ? 12 : 16} className={claimed || isToday ? "text-gold" : isNext ? "text-mint" : "text-line-strong"} />
              <span className={cn("text-xs font-bold tabular-nums", claimed || isToday ? "text-gold" : "text-ink")}>{r}</span>
              {claimed ? <span className="absolute right-0.5 top-0.5 text-[0.6rem] text-mint">✓</span> : null}
            </li>
          );
        })}
      </ol>

      {done ? (
        <div className="px-panel-gold flex flex-col items-center gap-2 border px-4 py-4 text-center animate-rise">
          <div className="h-display text-2xl text-gold">CHECK-IN COMPLETE</div>
          {result ? <Credits value={result.reward} sign className="text-3xl font-bold" /> : null}
          <div className="text-sm text-dim">STREAK · DAY {day}</div>
          <div className="mt-1 text-sm font-bold tracking-wider">COME BACK TOMORROW</div>
          {!compact ? <Countdown /> : null}
        </div>
      ) : (
        <button type="button" onClick={go} disabled={busy} className="px-btn px-btn-mint px-btn-lg w-full">
          <PixelIcon name="gift" size={14} /> {busy ? "CHECKING IN..." : `CHECK IN · +${rewards[pos - 1]} CR`}
        </button>
      )}
      {!compact ? <p className="text-xs text-faint">Miss a day and your streak resets to Day 1. Day 7 pays the jackpot, then the cycle repeats.</p> : null}
    </div>
  );
}
