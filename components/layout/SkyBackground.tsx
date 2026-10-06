import { pixelCanvas } from "@/components/pc/svg";

const CLOUD = [
  "........2222............",
  "......22111122....222...",
  "....221111111122221112..",
  "..2211111111111111111112",
  ".21111111111111111111113",
  "211111111111111111111133",
  "331111111111111111113333",
  ".33333333333333333333333",
];

function Cloud({ className, pink }: { className?: string; pink?: boolean }) {
  const { els, r } = pixelCanvas();
  const pal: Record<string, string> = { "1": "#8e7bc8", "2": pink ? "#f2c9d8" : "#c7b5ef", "3": "#6b58a8" };
  CLOUD.forEach((row, y) => [...row].forEach((ch, x) => ch !== "." && r(x, y, 1.02, 1.02, pal[ch])));
  return (
    <svg viewBox="0 0 24 8" className={className} shapeRendering="crispEdges" aria-hidden>
      {els}
    </svg>
  );
}

function Moon({ className }: { className?: string }) {
  const { els, r } = pixelCanvas();
  for (let y = 0; y < 14; y++)
    for (let x = 0; x < 14; x++) {
      const d = Math.hypot(x - 6.5, y - 6.5);
      if (d < 6.6) r(x, y, 1.02, 1.02, d > 5.6 ? "#f0c968" : "#fbe3a0");
    }
  [[4, 4, 2], [8, 7, 3], [5, 9, 1], [9, 3, 1]].forEach(([x, y, s]) => r(x, y, s, s, "#e9c873"));
  return (
    <svg viewBox="0 0 14 14" className={className} shapeRendering="crispEdges" aria-hidden>
      {els}
    </svg>
  );
}

/** Fixed pixel night sky behind every page: stars, moon, drifting clouds, soft rain. */
export function SkyBackground() {
  return (
    <div aria-hidden className="sky-gradient pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="sky-stars absolute inset-0" />
      <div className="absolute right-4 top-[62%] h-12 w-12 opacity-80 drop-shadow-[0_0_28px_rgba(251,227,160,0.45)] sm:right-[6%] sm:top-24 sm:h-24 sm:w-24 sm:opacity-100">
        <Moon className="h-full w-full" />
      </div>
      <Cloud className="cloud-drift absolute left-[3%] top-[22%] w-40 opacity-80 sm:w-56" />
      <Cloud className="cloud-drift absolute right-[2%] top-[48%] w-32 opacity-70 [animation-delay:-6s] sm:w-48" pink />
      <Cloud className="absolute -left-10 bottom-[6%] w-[22rem] opacity-90 sm:w-[30rem]" pink />
      <Cloud className="absolute -right-16 bottom-[-2%] w-[26rem] sm:w-[36rem]" />
      <div className="sky-rain absolute" />
    </div>
  );
}
