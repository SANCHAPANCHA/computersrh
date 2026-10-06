import Link from "next/link";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { cn, pad2 } from "@/lib/utils";
import type { LeaderRow } from "@/types/db";

const PODIUM = ["text-gold", "text-lilac", "text-pink"];

export function LeaderboardList({ rows, metric, unit }: { rows: LeaderRow[]; metric: "bestScore" | "buildsCount" | "totalLikes"; unit?: string }) {
  return (
    <ol className="divide-y divide-dashed divide-line border border-line">
      {rows.map((r, i) => (
        <li key={r.id}>
          <Link href={`/u/${r.username}`} className={cn("flex items-center gap-3 px-3 py-2.5 hover:bg-navy-700/60", i === 0 && "bg-gold/5")}>
            <span className={cn("w-8 text-xl font-bold tabular-nums", PODIUM[i] ?? "text-faint")}>{pad2(i + 1)}</span>
            <PixelAvatar id={r.avatar} size={28} />
            <span className="min-w-0 flex-1 truncate">@{r.username}</span>
            <span className={cn("text-xl font-bold tabular-nums", i < 3 ? PODIUM[i] : "text-ink")}>
              {r[metric]}
              {unit ? <span className="ml-1 text-xs text-dim">{unit}</span> : null}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
