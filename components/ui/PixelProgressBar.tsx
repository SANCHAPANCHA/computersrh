import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  max?: number;
  color?: string;
  label?: string;
  className?: string;
  height?: number;
}

export function PixelProgressBar({ value, max = 100, color, label, className, height }: Props) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className={cn("px-bar", className)}
      style={height ? { height } : undefined}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
    >
      <div className="px-bar-fill" style={{ width: `${pct}%`, "--bar": color } as CSSProperties} />
    </div>
  );
}

/** Text-mode loading bar: ████████░░░░ */
export function AsciiBar({ value, width = 16 }: { value: number; width?: number }) {
  const filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * width);
  return (
    <span aria-hidden className="font-label tracking-tight text-mint">
      {"█".repeat(filled)}
      <span className="text-line-strong">{"░".repeat(width - filled)}</span>
    </span>
  );
}
