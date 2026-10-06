import type { ReactElement, SVGProps } from "react";

/** Tiny helper to emit lots of keyed pixel rects. */
export function pixelCanvas() {
  const els: ReactElement[] = [];
  let k = 0;
  const r = (x: number, y: number, w: number, h: number, fill: string, props?: SVGProps<SVGRectElement>) => {
    if (w <= 0 || h <= 0) return;
    els.push(<rect key={k++} x={x} y={y} width={w} height={h} fill={fill} {...props} />);
  };
  const dash = (x: number, y: number, w: number, h: number, color = "#4a5690") => {
    els.push(<rect key={k++} x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} fill="none" stroke={color} strokeWidth={1} strokeDasharray="2 2" />);
  };
  return { els, r, dash };
}
