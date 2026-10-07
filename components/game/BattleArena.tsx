"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PcVisualizer } from "@/components/pc/PcVisualizer";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { useToast } from "@/components/ui/PixelToast";
import type { GameConfig } from "@/data/economy";
import { startBattle, type BattleResult } from "@/lib/game/actions";
import { BATTLE_LABELS } from "@/lib/game/battle";
import { resolveLeveled } from "@/lib/pc-engine/levels";
import { play } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { Credits } from "./Bits";

const STEPS = ["INITIALIZING BATTLE...", "MATCHMAKING ±SCORE...", "CHECKING CPU...", "CHECKING GPU...", "CHECKING MEMORY...", "CHECKING THERMALS...", "CHECKING POWER...", "CALCULATING PERFORMANCE..."];

interface Props {
  myName: string;
  myAvatar: string;
  myScore: number;
  upgrades: GameConfig["upgrades"];
  cooldownSeconds: number;
}

export function BattleArena({ myName, myAvatar, myScore, upgrades, cooldownSeconds }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [phase, setPhase] = useState<"ready" | "fighting" | "result">("ready");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);
  useEffect(() => () => void (timer.current && clearInterval(timer.current)), []);

  async function fight() {
    setPhase("fighting");
    setStep(0);
    play("boot");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stepMs = reduced ? 40 : 330;
    let s = 0;
    timer.current = setInterval(() => setStep(++s), stepMs);
    const [res] = await Promise.all([startBattle(), new Promise((r) => setTimeout(r, stepMs * STEPS.length))]);
    if (timer.current) clearInterval(timer.current);
    if (!res.ok) {
      setPhase("ready");
      play("error");
      return toast({ tone: "error", title: "BATTLE FAILED", message: res.error });
    }
    setResult(res.battle);
    setPhase("result");
    setCooldown(cooldownSeconds);
    play(res.battle.won ? "success" : "error");
    if (res.battle.streakBonus) toast({ tone: "achievement", title: `${res.battle.streak} WIN STREAK!`, message: `+${res.battle.streakBonus} bonus credits` });
    router.refresh();
  }

  if (phase === "fighting") {
    return (
      <div className="relative border border-line-strong bg-navy-950 p-5 font-label text-sm leading-7 text-mint" aria-live="polite">
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.03)_0_1px,transparent_1px_3px)]" />
        {STEPS.slice(0, Math.min(step + 1, STEPS.length)).map((l, i) => (
          <div key={l} className="flex justify-between gap-4">
            <span>{l}</span>
            {i < step ? <span className="text-mint">OK</span> : <span className="animate-blink">█</span>}
          </div>
        ))}
      </div>
    );
  }

  if (phase === "result" && result) {
    const opp = result.opponent;
    return (
      <div className="flex flex-col gap-4" aria-live="polite">
        <div className={cn("border-2 px-4 py-5 text-center", result.won ? "border-mint bg-mint/10" : "border-red bg-red/10")} style={{ animation: "reveal-flash 0.8s steps(8, end) both" }}>
          <div className={cn("h-display text-6xl sm:text-7xl", result.won ? "text-mint" : "text-red")}>{result.won ? "VICTORY" : "DEFEAT"}</div>
          <div className="mt-2 text-sm text-dim">{result.won ? "YOU WIN" : "YOU LOSE"} · {result.streak > 1 ? `${result.streak} WIN STREAK` : result.won ? "STREAK STARTED" : "STREAK RESET"}</div>
        </div>

        <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <Fighter name={myName} avatar={myAvatar} score={result.myScore} total={result.myTotal} winner={result.won} />
          <div className="h-display text-center text-3xl text-lilac">VS</div>
          <div className="flex flex-col gap-2">
            <Fighter name={opp.name} avatar={opp.avatar} score={result.oppScore} total={result.oppTotal} winner={!result.won} bot={opp.bot} />
            <div className="border border-line bg-navy-950">
              <PcVisualizer parts={resolveLeveled(opp.selection, opp.levels, upgrades)} rgb="pink" label={`${opp.name}'s PC`} />
            </div>
          </div>
        </div>

        <div className="px-panel p-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-stat-label py-1">STAT</th>
                <th className="px-stat-label py-1 text-right">YOU</th>
                <th className="px-stat-label py-1 text-right">THEM</th>
                <th className="px-stat-label py-1 text-right">DIFF</th>
              </tr>
            </thead>
            <tbody>
              {result.lines.map((l) => (
                <tr key={l.stat} className="border-t border-dashed border-line">
                  <td className="py-1.5 font-bold tracking-wider">{BATTLE_LABELS[l.stat]}</td>
                  <td className="py-1.5 text-right tabular-nums">{l.mine}</td>
                  <td className="py-1.5 text-right tabular-nums text-dim">{l.theirs}</td>
                  <td className={cn("py-1.5 text-right font-bold tabular-nums", l.diff > 0 ? "text-mint" : l.diff < 0 ? "text-red" : "text-dim")}>{l.diff > 0 ? `+${l.diff}` : l.diff}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex items-baseline justify-center gap-3 border-t border-line pt-3">
            <span className="px-stat-label">FINAL SCORE</span>
            <span className={cn("text-3xl font-bold tabular-nums", result.won ? "text-mint" : "text-ink")}>{Math.round(result.myTotal)}</span>
            <span className="text-dim">VS</span>
            <span className={cn("text-3xl font-bold tabular-nums", !result.won ? "text-red" : "text-ink")}>{Math.round(result.oppTotal)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 border border-dashed border-line-strong px-4 py-3 text-sm">
          <span className="px-stat-label">REWARDS</span>
          {result.rewarded ? <Credits value={result.credits} sign className="text-lg font-bold" /> : <span className="text-faint">Daily reward limit reached: no credits</span>}
          <span className="font-bold text-lilac">+{result.points} BP</span>
          {result.streakBonus ? <span className="font-bold text-gold">STREAK BONUS +{result.streakBonus}</span> : null}
        </div>

        <button type="button" className="px-btn px-btn-mint px-btn-lg" onClick={fight} disabled={cooldown > 0}>
          <PixelIcon name="swords" size={14} /> {cooldown > 0 ? `COOLING DOWN · ${cooldown}s` : "BATTLE AGAIN"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 border border-dashed border-line-strong px-4 py-8 text-center">
      <PixelIcon name="swords" size={40} className="text-lilac" />
      <div className="h-display text-3xl">READY TO FIGHT</div>
      <p className="max-w-md text-sm text-dim">You&apos;ll be matched with a player whose PC score is close to yours ({myScore}). Every stat is compared: CPU, GPU, memory, thermals, power and balance.</p>
      <button type="button" className="px-btn px-btn-mint px-btn-lg" onClick={fight} disabled={cooldown > 0}>
        <PixelIcon name="swords" size={14} /> FIND OPPONENT & BATTLE
      </button>
    </div>
  );
}

function Fighter({ name, avatar, score, total, winner, bot }: { name: string; avatar: string; score: number; total: number; winner: boolean; bot?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 border px-3 py-2.5", winner ? "border-mint bg-mint/5" : "border-line bg-navy-950/60")}>
      <PixelAvatar id={avatar} size={40} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-bold">{name}</div>
        <div className="text-xs text-dim">{bot ? "LAB BOT · " : ""}PC SCORE {score}</div>
      </div>
      <div className="text-right">
        <div className="px-stat-label">POWER</div>
        <div className={cn("text-xl font-bold tabular-nums", winner ? "text-mint" : "text-ink")}>{Math.round(total)}</div>
      </div>
    </div>
  );
}
