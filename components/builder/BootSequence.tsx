"use client";

import { useEffect, useState } from "react";
import { play } from "@/lib/sound";
import type { BuildSummary } from "@/lib/pc-engine";

export function BootSequence({ summary, chaos, onDone }: { summary: BuildSummary; chaos: boolean; onDone: () => void }) {
  const p = summary.parts;
  const errs = (cat: string) => summary.conflicts.some((c) => c.severity === "error" && c.categories.includes(cat as never));
  const lines: [string, string][] = [
    [`CHECKING CPU ........ ${p.cpu?.name.toUpperCase()}`, errs("cpu") ? "WARN" : "OK"],
    [`CHECKING GPU ........ ${p.gpu?.metadata.vram}GB VRAM`, errs("gpu") ? "WARN" : "OK"],
    [`CHECKING MEMORY ..... ${p.ram?.metadata.capacityGb}GB ${p.ram?.metadata.ramType}`, errs("ram") ? "WARN" : "OK"],
    [`CHECKING STORAGE .... ${p.storage?.metadata.capacityTb}TB`, "OK"],
    [`CHECKING POWER ...... ${summary.power.draw}W / ${summary.power.capacity}W`, errs("psu") ? "WARN" : "OK"],
  ];
  const [shown, setShown] = useState(0);

  useEffect(() => {
    play("boot");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = reduced ? 60 : 320;
    const timers = Array.from({ length: lines.length + 2 }, (_, i) => setTimeout(() => setShown(i + 1), step * (i + 1)));
    const done = setTimeout(onDone, step * (lines.length + 3) + 300);
    const onKey = (e: KeyboardEvent) => (e.key === "Escape" || e.key === "Enter") && onDone();
    window.addEventListener("keydown", onKey);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-navy-950 p-5" role="dialog" aria-modal="true" aria-label="Boot sequence">
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.03)_0_1px,transparent_1px_3px)]" />
      <div className="relative w-full max-w-xl font-label text-sm leading-7 text-mint sm:text-base" aria-live="polite">
        <div className="text-cream">BOOTING RH PC LAB...</div>
        {chaos ? <div className="text-hot">CHAOS MODE ACTIVE — RULES DISABLED</div> : null}
        {lines.slice(0, shown).map(([l, s]) => (
          <div key={l} className="flex justify-between gap-4">
            <span className="truncate">{l}</span>
            <span className={s === "OK" ? "text-mint" : "text-hot"}>{s}</span>
          </div>
        ))}
        {shown > lines.length ? <div className="mt-2 text-cream">SYSTEM READY<span className="animate-blink">_</span></div> : null}
        {shown <= lines.length ? <span className="animate-blink">█</span> : null}
      </div>
      <button type="button" onClick={onDone} className="px-btn px-btn-ghost px-btn-sm absolute bottom-6 right-6">
        SKIP ▶▶
      </button>
    </div>
  );
}
