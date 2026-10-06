import type { CSSProperties, ReactNode } from "react";
import { RARITY_COLORS } from "@/lib/pc-engine/rarity";
import { cn } from "@/lib/utils";
import type { Rarity } from "@/types/game";

export function RarityBadge({ rarity, solid, className, suffix }: { rarity: Rarity; solid?: boolean; className?: string; suffix?: string }) {
  return (
    <span
      className={cn("px-badge", solid && "px-badge-solid", rarity === "MYTHIC" && "rarity-mythic", className)}
      style={{ "--badge": RARITY_COLORS[rarity] } as CSSProperties}
    >
      <span aria-hidden>◆</span>
      {rarity}
      {suffix ? ` ${suffix}` : ""}
    </span>
  );
}

export function PixelBadge({ color, solid, children, className }: { color?: string; solid?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={cn("px-badge", solid && "px-badge-solid", className)} style={color ? ({ "--badge": color } as CSSProperties) : undefined}>
      {children}
    </span>
  );
}
