"use client";

import { useEffect, useState } from "react";
import { pad2 } from "@/lib/utils";

/** Countdown boxes to the next UTC midnight (daily challenge reset). */
export function Countdown({ className }: { className?: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
      setLeft(Math.max(0, next - now.getTime()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const s = Math.floor((left ?? 0) / 1000);
  const units: [string, number][] = [["HOURS", Math.floor(s / 3600)], ["MINUTES", Math.floor((s % 3600) / 60)], ["SECONDS", s % 60]];
  return (
    <div className={className} role="timer" aria-label="Time until the next daily challenge">
      <div className="flex gap-2">
        {units.map(([label, v]) => (
          <div key={label} className="px-panel min-w-[4.2rem] px-2 py-2 text-center">
            <div className="text-2xl font-bold tabular-nums text-gold sm:text-3xl">{left === null ? "--" : pad2(v)}</div>
            <div className="mt-1 font-label text-[0.55rem] tracking-widest text-dim">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
