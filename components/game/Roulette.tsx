"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { PartVisual } from "@/components/pc/PartVisual";
import { Countdown } from "@/components/ui/Countdown";
import { RarityBadge } from "@/components/ui/PixelBadge";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { useToast } from "@/components/ui/PixelToast";
import { COMPONENTS } from "@/data/components";
import type { RouletteSlot } from "@/data/economy";
import { spinRoulette } from "@/lib/game/actions";
import type { SpinReward } from "@/lib/game/roulette";
import { getComponent } from "@/lib/pc-engine/catalog";
import { RARITY_COLORS } from "@/lib/pc-engine/rarity";
import { play } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { Credits } from "./Bits";

const TILE = 104; // px incl. gap
const STOP_INDEX = 38;
const TILES = 44;

// Deterministic LCG so server and client render the same idle reel.
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

function sample(slots: RouletteSlot[], rand: () => number): SpinReward {
  const total = slots.reduce((a, s) => a + s.weight, 0);
  let r = rand() * total;
  const slot = slots.find((s) => (r -= s.weight) < 0) ?? slots[0];
  if (slot.reward.type === "credits") return { type: "credits", amount: slot.reward.amount };
  const rarity = slot.reward.rarity;
  const pool = COMPONENTS.filter((c) => c.rarity === rarity);
  return { type: "component", rarity, componentId: pool[Math.floor(rand() * pool.length)].id };
}

function Tile({ reward, big }: { reward: SpinReward; big?: boolean }) {
  const c = reward.type === "component" ? getComponent(reward.componentId) : null;
  const color = c ? RARITY_COLORS[c.rarity] : "#f7d58b";
  return (
    <div className={cn("flex flex-none flex-col items-center justify-center gap-1 border-2 bg-navy-950", big ? "h-36 w-44" : "h-24 w-24")} style={{ borderColor: color, boxShadow: `inset 0 -4px 0 ${color}` }}>
      {c ? (
        <>
          <PartVisual component={c} className={big ? "h-16 w-24" : "h-10 w-16"} />
          <span className={cn("max-w-full truncate px-1 font-label tracking-wider", big ? "text-[0.65rem]" : "text-[0.5rem]")} style={{ color }}>{c.rarity}</span>
        </>
      ) : (
        <>
          <PixelIcon name="coin" size={big ? 40 : 26} className="text-gold" />
          <span className={cn("font-bold text-gold", big ? "text-lg" : "text-xs")}>{reward.type === "credits" ? reward.amount : ""}</span>
        </>
      )}
    </div>
  );
}

interface Props {
  slots: (RouletteSlot & { pct: number })[];
  doneToday: boolean;
  todayReward: SpinReward | null;
}

export function Roulette({ slots, doneToday, todayReward }: Props) {
  const router = useRouter();
  const toast = useToast();
  const strip = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "spinning" | "won">(doneToday ? "won" : "idle");
  const [won, setWon] = useState<{ reward: SpinReward; duplicate: boolean; level: number } | null>(todayReward ? { reward: todayReward, duplicate: false, level: 1 } : null);
  const [reel, setReel] = useState<SpinReward[]>(() => {
    const rand = lcg(7);
    return Array.from({ length: TILES }, () => sample(slots, rand));
  });
  // True only for a spin made on this page view (server props flip to doneToday after refresh).
  const [fresh, setFresh] = useState(false);

  async function spin() {
    setPhase("spinning");
    play("click");
    const res = await spinRoulette();
    if (!res.ok) {
      setPhase("idle");
      play("error");
      return toast({ tone: "error", title: "SPIN FAILED", message: res.error });
    }
    const rand = lcg(Date.now());
    const next = Array.from({ length: TILES }, () => sample(slots, rand));
    next[STOP_INDEX] = res.reward;
    setReel(next);
    requestAnimationFrame(() => {
      const el = strip.current;
      if (!el) return;
      const viewport = el.parentElement!.clientWidth;
      const jitter = (Math.random() - 0.5) * (TILE * 0.5);
      const target = -(STOP_INDEX * TILE - viewport / 2 + TILE / 2 + jitter);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const anim = el.animate([{ transform: "translateX(0)" }, { transform: `translateX(${target}px)` }], {
        duration: reduced ? 200 : 5200,
        // Slow start (spin-up), fast middle, long slow-down to a stop.
        easing: "cubic-bezier(0.55, 0.0, 0.15, 1)",
        fill: "forwards",
      });
      anim.onfinish = () => {
        setWon({ reward: res.reward, duplicate: res.duplicate, level: res.level });
        setFresh(true);
        setPhase("won");
        play("success");
        router.refresh();
      };
    });
  }

  const wonComp = won?.reward.type === "component" ? getComponent(won.reward.componentId) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden border border-line-strong bg-navy-950 py-4">
        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-[3px] -translate-x-1/2 bg-mint shadow-[0_0_12px_#3ce6b0]" />
        <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-mint" />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-navy-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-navy-950 to-transparent" />
        <div ref={strip} className="flex gap-2 pl-2 will-change-transform" aria-hidden>
          {reel.map((r, i) => <Tile key={i} reward={r} />)}
        </div>
      </div>

      {phase === "won" && won ? (
        <div className={cn("flex flex-col items-center gap-3 border px-4 py-5 text-center", fresh && "animate-rise")} style={{ borderColor: wonComp ? RARITY_COLORS[wonComp.rarity] : "#f7d58b" }} aria-live="polite">
          <div className="kicker justify-center">{fresh ? "✧ YOU WON" : "✧ TODAY'S PRIZE"}</div>
          <div style={fresh ? { animation: "reveal-flash 0.8s steps(8, end) both" } : undefined}>
            <Tile reward={won.reward} big />
          </div>
          {wonComp ? (
            <>
              <RarityBadge rarity={wonComp.rarity} solid className="!text-sm" />
              <div className="h-display text-3xl">{wonComp.name}</div>
              {won.duplicate ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="font-bold text-mint">DUPLICATE FOUND · UPGRADE AVAILABLE</div>
                  <Link href="/inventory?f=upgrades" className="px-btn px-btn-mint px-btn-sm"><PixelIcon name="up" size={12} /> UPGRADE NOW</Link>
                </div>
              ) : (
                <Link href="/inventory" className="px-btn px-btn-sm"><PixelIcon name="floppy" size={12} /> ADDED TO INVENTORY</Link>
              )}
            </>
          ) : won.reward.type === "credits" ? (
            <Credits value={won.reward.amount} sign className="text-4xl font-bold" />
          ) : null}
          <div className="mt-2 px-panel px-4 py-2">
            <div className="mb-1 text-xs font-bold text-dim">NEXT FREE SPIN</div>
            <Countdown />
          </div>
        </div>
      ) : (
        <button type="button" onClick={spin} disabled={phase === "spinning"} className="px-btn px-btn-mint px-btn-lg w-full">
          <PixelIcon name="dice" size={14} /> {phase === "spinning" ? "SPINNING..." : "SPIN · FREE"}
        </button>
      )}

      <details className="px-panel px-3 py-2 text-sm">
        <summary className="cursor-pointer select-none text-dim hover:text-ink">DROP RATES</summary>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {slots.map((s, i) => (
            <li key={i} className="flex justify-between gap-3 border-b border-dashed border-line py-1">
              <span style={{ color: s.reward.type === "component" ? RARITY_COLORS[s.reward.rarity] : "#f7d58b" }}>
                {s.reward.type === "component" ? `${s.reward.rarity} PART` : `${s.reward.amount} CREDITS`}
              </span>
              <span className="tabular-nums text-dim">{s.pct < 1 ? s.pct.toFixed(1) : s.pct.toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
