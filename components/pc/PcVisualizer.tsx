import { RARITY_COLORS } from "@/lib/pc-engine/rarity";
import { shade } from "@/lib/utils";
import { RGB_COLORS, type BuildParts, type CaseSize, type RgbColor } from "@/types/game";
import { pixelCanvas } from "./svg";

interface Props {
  parts: BuildParts;
  rgb?: RgbColor;
  /** Adds CSS animation classes (browser only — omit for OG images). */
  animated?: boolean;
  className?: string;
  label?: string;
  width?: number | string;
  height?: number | string;
}

const CASE_DIMS: Record<CaseSize, [number, number]> = { MINI: [38, 48], MID: [46, 72], FULL: [52, 86] };
const MOUNTAINS = [3, 6, 9, 7, 4, 8, 11, 7, 5, 9, 6, 3, 7, 10, 6, 4, 8, 5, 9, 6, 4, 7, 10, 5, 3, 6, 8, 4];
const STARS: [number, number][] = [[58, 8], [80, 20], [104, 6], [126, 16], [150, 9], [176, 22], [8, 46], [196, 40], [112, 30]];

/**
 * Pixel-art desk scene of the current build. Pure SVG with no hooks so it can
 * render in client components, server components and next/og images.
 */
export function PcVisualizer({ parts, rgb = "mint", animated, className, label, width = "100%", height }: Props) {
  const { els, r, dash } = pixelCanvas();
  const lit = rgb !== "off";
  const glow = RGB_COLORS[rgb];
  const pulse = animated ? "rgb-pulse" : undefined;

  // ── Room ──
  r(0, 0, 200, 124, "#111a3d");
  r(0, 86, 200, 10, "#152051");
  for (const [x, y] of STARS) r(x, y, 1, 1, "#ffffff", { opacity: 0.35 });
  // window with moon
  r(10, 9, 36, 28, "#f6d8ce");
  r(12, 11, 32, 24, "#29286e");
  r(34, 14, 6, 6, "#f7d58b");
  r(33, 15, 8, 4, "#f7d58b");
  r(36, 15, 2, 1, "#e0b96a");
  r(14, 28, 13, 3, "#8f7cc6");
  r(17, 26, 7, 2, "#a898e0");
  r(27, 11, 2, 24, "#f6d8ce");
  r(12, 22, 32, 2, "#f6d8ce");
  r(10, 37, 36, 2, "#d9a5aa");
  // desk
  r(0, 96, 200, 8, "#7a67b4");
  r(0, 96, 200, 1, "#a898e0");
  r(0, 104, 200, 20, "#4a3d86");
  r(0, 104, 200, 2, "#3a2f6b");
  r(12, 112, 44, 1, "#3a2f6b");
  r(144, 112, 44, 1, "#3a2f6b");
  r(32, 114, 4, 1, "#a898e0");
  r(164, 114, 4, 1, "#a898e0");

  // ── Tower ──
  const pc = parts.case;
  const [w, h] = pc ? CASE_DIMS[pc.metadata.size] : CASE_DIMS.MID;
  const x0 = 188 - w;
  const y0 = 99 - h;
  const bodyH = h - 2;
  const color = pc?.metadata.color ?? "#1b2247";
  const trim = pc?.metadata.trim ?? "#3b4680";

  if (pc) {
    if (lit) {
      r(x0 - 6, 98, w + 12, 2, glow, { opacity: 0.25, className: pulse });
      r(x0 - 2, 100, w + 4, 1, glow, { opacity: 0.18 });
    }
    r(x0 + 3, y0 + bodyH, 6, 2, "#0a0f22");
    r(x0 + w - 9, y0 + bodyH, 6, 2, "#0a0f22");
    r(x0, y0, w, bodyH, shade(trim, -0.2));
    r(x0 + 1, y0 + 1, w - 2, bodyH - 2, color);
    r(x0 + 1, y0 + 1, w - 2, 1, shade(color, 0.4));
    r(x0 + w - 2, y0 + 1, 1, bodyH - 2, shade(color, -0.25));
    // front strip
    const fx = x0 + w - 7;
    r(fx, y0 + 2, 5, bodyH - 4, shade(color, -0.14));
    r(fx + 1, y0 + 4, 3, 3, lit ? glow : "#8be0c0", { className: pulse });
    if (lit) r(fx + 2, y0 + 10, 1, bodyH - 18, glow, { className: pulse });
  } else {
    r(x0 - 2, 96, w + 4, 3, "#2c3866");
    dash(x0, y0, w, bodyH);
  }

  // Interior window
  const wx = x0 + 3;
  let wy = y0 + 4;
  const ww = w - 12;
  let wh = bodyH - 8;
  if (pc && !pc.metadata.glass) {
    const vents = Math.floor(wh * 0.38);
    for (let i = 0; i < vents / 3; i++) r(wx + 3, wy + 2 + i * 3, ww - 6, 1, shade(color, -0.22));
    wy += vents;
    wh -= vents;
  }
  if (pc) {
    r(wx - 1, wy - 1, ww + 2, wh + 2, shade(trim, -0.15));
    r(wx, wy, ww, wh, "#0a1029");
  }
  const ix = wx, iy = wy, iw = ww, ih = wh;

  // motherboard
  const mobo = parts.motherboard;
  if (mobo) {
    r(ix + 2, iy + 2, iw - 4, ih - 10, "#1a2a55");
    r(ix + 4, iy + ih - 13, iw - 10, 1, "#2f4a7a");
    r(ix + 4, iy + ih - 15, 1, 3, "#2f4a7a");
    r(ix + iw - 6, iy + 4, 2, 2, RARITY_COLORS[mobo.rarity]);
  } else if (Object.keys(parts).some((k) => k !== "case" && k !== "monitor" && k !== "keyboard" && k !== "mouse")) {
    dash(ix + 2, iy + 2, iw - 4, ih - 10, "#2c3866");
  }

  // cpu (visible only without cooler)
  const cpu = parts.cpu;
  if (cpu && !parts.cooling) {
    r(ix + 6, iy + 8, 7, 7, "#c9cfe8");
    r(ix + 8, iy + 10, 3, 3, RARITY_COLORS[cpu.rarity]);
  }

  // cooling
  const cool = parts.cooling;
  if (cool) {
    const m = cool.metadata;
    if (m.type === "AIR") {
      const ch = (m.height ?? 60) > 150 ? 14 : (m.height ?? 60) > 100 ? 11 : 5;
      const cx = ix + 5, cy = iy + (ch > 5 ? 5 : 9);
      r(cx, cy, 10, ch, "#aeb6d6");
      for (let j = 0; j < ch / 2; j++) r(cx, cy + 1 + j * 2, 10, 1, "#7c86ad");
      r(cx + 10, cy, 2, ch, "#39406a");
      if (ch > 5 && lit) r(cx + 10, cy + 2, 2, 2, glow, { className: pulse });
    } else {
      const fans = Math.round((m.radiator ?? 240) / 120);
      r(ix + 2, iy + 1, iw - 4, 4, "#252e57");
      for (let i = 0; i < fans; i++) {
        const fx = ix + 4 + i * Math.floor((iw - 8) / fans);
        r(fx, iy + 2, Math.max(4, Math.floor((iw - 8) / fans) - 3), 2, "#11183a");
      }
      r(ix + 6, iy + 9, 8, 8, "#2a3358");
      r(ix + 7, iy + 10, 6, 6, lit ? glow : "#5a6390", { className: pulse });
      r(ix + 8, iy + 11, 4, 4, "#11183a");
      if (m.type === "CUSTOM") {
        r(ix + 8, iy + 5, 1, 4, glow);
        r(ix + 11, iy + 5, 1, 4, glow);
        r(ix + iw - 8, iy + 8, 4, 14, "#0e1532");
        r(ix + iw - 7, iy + 12, 2, 9, glow, { className: pulse });
        r(ix + 14, iy + 13, iw - 22, 1, glow);
      } else {
        r(ix + 8, iy + 5, 1, 4, "#39406a");
        r(ix + 11, iy + 5, 1, 4, "#39406a");
      }
    }
  }

  // ram
  const ram = parts.ram;
  if (ram) {
    const n = ram.metadata.sticks;
    const start = Math.min(ix + 18, ix + iw - 4 - n * 3);
    for (let i = 0; i < n; i++) {
      r(start + i * 3, iy + 7, 2, 11, "#2f3a6a");
      r(start + i * 3, iy + 7, 2, 2, lit ? glow : RARITY_COLORS[ram.rarity], { className: pulse });
    }
  }

  // gpu — length is to scale, so oversize cards poke out (Chaos Mode!)
  const gpu = parts.gpu;
  if (gpu) {
    const gy = iy + Math.round(ih * 0.56);
    const len = Math.round((gpu.metadata.length / 400) * (iw - 2));
    const gh = gpu.metadata.fans >= 3 ? 7 : 5;
    r(ix + 1, gy - 1, 1, gh + 2, "#8a93b8");
    r(ix + 2, gy, len, gh, "#1b2240");
    r(ix + 2, gy, len, 1, RARITY_COLORS[gpu.rarity]);
    const step = len / gpu.metadata.fans;
    for (let i = 0; i < gpu.metadata.fans; i++) {
      const fx = Math.round(ix + 2 + step * i + step / 2 - 2);
      r(fx, gy + 2, 4, gh - 3, "#0a0f22");
      r(fx + 1, gy + 3, 2, Math.max(1, gh - 5), "#5a6390");
    }
    if (lit) r(ix + 2, gy + gh, len, 1, glow, { opacity: 0.7, className: pulse });
  }

  // psu shroud + storage
  if (pc || parts.psu) {
    r(ix + 1, iy + ih - 7, iw - 2, 6, "#151d40");
    const psu = parts.psu;
    if (psu) {
      r(ix + 3, iy + ih - 5, 2, 2, lit ? glow : "#3ce6b0");
      r(ix + 7, iy + ih - 4, Math.round((psu.metadata.wattage / 1600) * (iw - 12)), 1, RARITY_COLORS[psu.rarity]);
    }
  }
  const sto = parts.storage;
  if (sto) r(ix + iw - 11, iy + ih - 12, 8, 3, sto.metadata.interface === "NVME" ? "#5eb0ff" : "#8ea0b8");

  if (pc?.metadata.glass) {
    r(wx + ww - 5, wy + 2, 1, 9, "#ffffff", { opacity: 0.14 });
    r(wx + ww - 7, wy + 4, 1, 12, "#ffffff", { opacity: 0.08 });
  }

  // ── Monitor ──
  const mon = parts.monitor;
  const cx = 70;
  if (mon) {
    const crt = !!mon.metadata.crt;
    const [mw, mh] = crt ? [46, 38] : mon.metadata.ultrawide ? [112, 34] : mon.metadata.sizeIn >= 32 ? [82, 48] : mon.metadata.sizeIn >= 27 ? [72, 43] : mon.metadata.sizeIn >= 24 ? [62, 38] : [56, 34];
    const neck = crt ? 2 : 10;
    const bottom = 95 - neck;
    const sx = Math.round(cx - mw / 2), sy = bottom - mh;
    const bezel = crt ? "#e8d9b8" : "#1a1f3c";
    const b = crt ? 5 : 3;
    if (lit && mon.metadata.refreshHz >= 144) r(sx - 2, sy - 2, mw + 4, mh + 4, glow, { opacity: 0.12, className: pulse });
    r(sx, sy, mw, mh, shade(bezel, -0.35));
    r(sx + 1, sy + 1, mw - 2, mh - 2, bezel);
    const scx = sx + b, scy = sy + b, scw = mw - b * 2, sch = mh - b * 2 - (crt ? 2 : 0);
    r(scx, scy, scw, sch, "#2a2470");
    r(scx, scy + Math.round(sch * 0.45), scw, Math.round(sch * 0.25), "#3d3290");
    r(scx + scw - 9, scy + 3, 4, 4, "#f7d58b");
    r(scx + 3, scy + 3, 12, 2, "#fff4dc", { opacity: 0.85 });
    r(scx + 3, scy + 6, 7, 1, "#a898e0");
    for (let i = 0; i * 4 < scw; i++) {
      const mhgt = Math.min(sch - 6, MOUNTAINS[i % MOUNTAINS.length]);
      r(scx + i * 4, scy + sch - mhgt - 3, Math.min(4, scw - i * 4), mhgt, "#4b3f99");
    }
    for (let i = 0; i * 6 < scw; i++) {
      const fh = Math.min(sch - 8, Math.round(MOUNTAINS[(i + 5) % MOUNTAINS.length] / 2) + 1);
      r(scx + i * 6, scy + sch - fh - 3, Math.min(6, scw - i * 6), fh, lit ? glow : "#3ce6b0", { opacity: 0.85 });
    }
    r(scx, scy + sch - 3, scw, 3, "#1a1550");
    if (crt) {
      for (let y = scy; y < scy + sch; y += 2) r(scx, y, scw, 1, "#000000", { opacity: 0.18 });
      r(cx - 16, 95, 32, 2, shade(bezel, -0.15));
      r(sx + mw - 9, sy + mh - 4, 3, 1, lit ? glow : "#3ce6b0");
      r(sx + 4, sy + mh - 4, 8, 1, shade(bezel, -0.2));
    } else {
      r(cx - 3, bottom, 6, neck, "#2a3156");
      r(cx - 13, 95, 26, 2, "#2a3156");
      r(sx + mw - 6, sy + mh - 2, 2, 1, lit ? glow : "#3ce6b0");
    }
  } else {
    dash(cx - 31, 47, 62, 38);
    r(cx - 13, 95, 26, 2, "#2c3866");
  }

  // ── Keyboard & mouse ──
  const kb = parts.keyboard;
  const kw = kb ? (kb.metadata.layout === "FULL" ? 50 : kb.metadata.layout === "TKL" ? 40 : 30) : 40;
  const kx = Math.round(cx - kw / 2 - 4), ky = 99;
  if (kb) {
    const retro = !!kb.metadata.retro;
    const base = retro ? "#e8d9b8" : "#1e2548";
    const key = retro ? "#9c8a64" : kb.metadata.rgb && lit ? glow : "#5a6390";
    if (kb.metadata.rgb && lit) r(kx - 1, ky + 4, kw + 2, 1, glow, { opacity: 0.55, className: pulse });
    r(kx, ky, kw, 4, shade(base, -0.35));
    r(kx, ky, kw, 3, base);
    for (let i = 0; i < (kw - 2) / 2; i++) {
      r(kx + 1 + i * 2, ky + 1, 1, 1, key, { opacity: 0.9 });
      if (i % 2 === 0) r(kx + 2 + i * 2, ky + 2, 1, 1, key, { opacity: 0.6 });
    }
  } else {
    dash(kx, ky, kw, 4);
  }
  const mouse = parts.mouse;
  const mx = kx + kw + 6;
  if (mouse) {
    r(mx, ky, 6, 4, "#0d1230");
    r(mx, ky, 6, 3, "#262e58");
    r(mx + 3, ky, 1, 2, "#5a6390");
    if (mouse.metadata.rgb && lit) r(mx + 1, ky + 2, 1, 1, glow, { className: pulse });
  } else {
    dash(mx, ky, 6, 4);
  }

  return (
    <svg
      viewBox="0 0 200 124"
      width={width}
      height={height}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label={label ?? "Pixel-art preview of the PC build"}
      preserveAspectRatio="xMidYMid meet"
    >
      {els}
    </svg>
  );
}
