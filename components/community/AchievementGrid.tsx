import { PixelIcon } from "@/components/ui/PixelIcon";
import { ACHIEVEMENTS } from "@/data/achievements";
import { cn } from "@/lib/utils";

export function AchievementGrid({ unlocked, compact }: { unlocked: Record<string, string>; compact?: boolean }) {
  return (
    <ul className={cn("grid gap-2.5", compact ? "grid-cols-4 sm:grid-cols-8" : "sm:grid-cols-2 lg:grid-cols-4")}>
      {ACHIEVEMENTS.map((a) => {
        const at = unlocked[a.id];
        if (compact) {
          return (
            <li key={a.id} title={`${a.name} — ${a.description}${at ? " (unlocked)" : " (locked)"}`}>
              <div className={cn("grid aspect-square place-items-center border", at ? "border-gold bg-gold/10 text-gold" : "border-line bg-navy-950 text-line-strong")}>
                <PixelIcon name={at ? a.icon : "lock"} size={22} title={`${a.name}: ${at ? "unlocked" : "locked"}`} />
              </div>
            </li>
          );
        }
        return (
          <li key={a.id} className={cn("flex items-center gap-3 border p-3", at ? "border-gold/70 bg-gold/5" : "border-line bg-navy-950/60")}>
            <div className={cn("grid h-12 w-12 flex-none place-items-center border", at ? "border-gold bg-gold/15 text-gold" : "border-line text-line-strong")}>
              <PixelIcon name={at ? a.icon : "lock"} size={24} />
            </div>
            <div className="min-w-0">
              <div className={cn("font-bold tracking-wide", at ? "text-ink" : "text-dim")}>{a.name}</div>
              <div className="text-xs text-dim">{a.description}</div>
              <div className={cn("mt-1 font-label text-[0.58rem] tracking-widest", at ? "text-gold" : "text-faint")}>
                {at ? `UNLOCKED · ${new Date(at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "LOCKED"}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
