import { RarityBadge } from "@/components/ui/PixelBadge";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { resolveSelection } from "@/lib/pc-engine/catalog";
import { formatValue } from "@/lib/pc-engine/value";
import { CATEGORY_LABELS, type Category, type Selection } from "@/types/game";

const ORDER: Category[] = ["cpu", "gpu", "ram", "storage", "motherboard", "psu", "cooling", "case", "monitor", "keyboard", "mouse"];

export function ComponentList({ selection }: { selection: Selection }) {
  const parts = resolveSelection(selection);
  return (
    <ul className="divide-y divide-dashed divide-line border border-line">
      {ORDER.map((cat) => {
        const c = parts[cat];
        return (
          <li key={cat} className="grid grid-cols-[1.25rem_6.5rem_1fr] items-center gap-3 px-3 py-2.5 sm:grid-cols-[1.25rem_7.5rem_1fr_auto]">
            <PixelIcon name={cat} size={16} className="text-lilac" />
            <span className="px-stat-label">{CATEGORY_LABELS[cat]}</span>
            <span className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="truncate font-bold">{c?.name ?? "—"}</span>
              {c ? <RarityBadge rarity={c.rarity} /> : null}
            </span>
            <span className="hidden text-right text-xs text-gold sm:block">{c ? formatValue(c.price) : ""}</span>
          </li>
        );
      })}
    </ul>
  );
}
