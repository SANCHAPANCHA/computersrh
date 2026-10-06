"use client";

import { RARITY_COLORS } from "@/lib/pc-engine/rarity";
import { cn } from "@/lib/utils";
import { RARITIES, type Rarity } from "@/types/game";

export type PartSort = "rarity" | "price-asc" | "price-desc" | "perf";

export interface PartFilterState {
  sort: PartSort;
  rarity: Rarity | "ALL";
  compatibleOnly: boolean;
}

export const DEFAULT_FILTERS: PartFilterState = { sort: "rarity", rarity: "ALL", compatibleOnly: false };

export function PartFilters({ value, onChange, shown, total, chaos }: { value: PartFilterState; onChange: (v: PartFilterState) => void; shown: number; total: number; chaos: boolean }) {
  return (
    <div className="px-panel mt-3 flex flex-col gap-2.5 p-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="part-sort" className="px-stat-label">SORT</label>
        <select
          id="part-sort"
          value={value.sort}
          onChange={(e) => onChange({ ...value, sort: e.target.value as PartSort })}
          className="px-input !w-auto !py-1.5 !text-sm"
        >
          <option value="rarity">RARITY</option>
          <option value="price-asc">PRICE ↑</option>
          <option value="price-desc">PRICE ↓</option>
          <option value="perf">PERFORMANCE</option>
        </select>
        {!chaos ? (
          <button
            type="button"
            role="switch"
            aria-checked={value.compatibleOnly}
            onClick={() => onChange({ ...value, compatibleOnly: !value.compatibleOnly })}
            className={cn("border px-2.5 py-1.5 text-xs tracking-wider", value.compatibleOnly ? "border-mint bg-mint/15 text-mint" : "border-line-strong text-dim hover:text-ink")}
          >
            {value.compatibleOnly ? "✓ " : ""}COMPATIBLE ONLY
          </button>
        ) : null}
        <span className="ml-auto text-xs text-faint">{shown}/{total} parts</span>
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by rarity">
        {(["ALL", ...RARITIES] as const).map((r) => {
          const active = value.rarity === r;
          const color = r === "ALL" ? "var(--color-cream)" : RARITY_COLORS[r];
          return (
            <button
              key={r}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ ...value, rarity: r })}
              className="border px-2 py-1 font-label text-[0.6rem] tracking-widest"
              style={active ? { background: color, borderColor: color, color: "#0b1330" } : { borderColor: "var(--color-line)", color }}
            >
              {r}
            </button>
          );
        })}
      </div>
    </div>
  );
}
