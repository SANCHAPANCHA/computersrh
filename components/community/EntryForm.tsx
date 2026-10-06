"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/PixelToast";
import { submitChallengeEntry } from "@/lib/db/actions";

export interface EntryOption {
  id: string;
  name: string;
  score: number;
  fails: string[];
}

export function EntryForm({ options, currentId }: { options: EntryOption[]; currentId?: string }) {
  const router = useRouter();
  const toast = useToast();
  const eligible = options.filter((o) => !o.fails.length);
  const [pick, setPick] = useState(eligible[0]?.id ?? "");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const res = await submitChallengeEntry(pick);
    setBusy(false);
    if (res.ok) { toast({ tone: "success", title: "ENTRY SUBMITTED" }); router.refresh(); }
    else toast({ tone: "error", title: "ENTRY REJECTED", message: res.error });
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="max-h-72 divide-y divide-dashed divide-line overflow-y-auto border border-line">
        {options.map((o) => (
          <li key={o.id}>
            <label className={`flex cursor-pointer items-start gap-3 px-3 py-2.5 ${o.fails.length ? "cursor-not-allowed opacity-60" : "hover:bg-navy-700/50"}`}>
              <input type="radio" name="entry" value={o.id} disabled={!!o.fails.length} checked={pick === o.id} onChange={() => setPick(o.id)} className="mt-1 accent-[var(--color-mint)]" />
              <span className="min-w-0 flex-1">
                <span className="flex justify-between gap-2">
                  <span className="truncate font-bold">{o.name}{o.id === currentId ? " · CURRENT ENTRY" : ""}</span>
                  <span className="text-mint">{o.score}</span>
                </span>
                {o.fails.length ? <span className="block text-xs text-red">✕ {o.fails[0]}</span> : <span className="block text-xs text-mint">✓ Meets all rules</span>}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <button type="button" className="px-btn px-btn-mint" disabled={!pick || busy || pick === currentId} onClick={submit}>
        {busy ? "SUBMITTING..." : currentId ? "[ REPLACE ENTRY ]" : "[ SUBMIT ENTRY ]"}
      </button>
    </div>
  );
}
