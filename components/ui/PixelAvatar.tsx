import { getAvatar } from "@/data/avatars";
import { cn } from "@/lib/utils";

export function PixelAvatar({ id, size = 40, className, ring }: { id: string | null | undefined; size?: number; className?: string; ring?: boolean }) {
  const a = getAvatar(id);
  return (
    <svg
      viewBox="-1 -1 10 10"
      width={size}
      height={size}
      className={cn("pixelated flex-none", ring && "outline outline-2 outline-offset-2 outline-mint", className)}
      role="img"
      aria-label={`${a.name} avatar`}
    >
      <rect x="-1" y="-1" width="10" height="10" fill={a.bg} />
      {a.grid.flatMap((row, y) =>
        [...row].map((ch, x) => (ch === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={a.palette[ch]} />)),
      )}
    </svg>
  );
}
