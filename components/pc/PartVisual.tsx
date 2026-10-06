import { RARITY_COLORS } from "@/lib/pc-engine/rarity";
import { shade } from "@/lib/utils";
import type { GameComponent } from "@/types/game";
import { pixelCanvas } from "./svg";

const LIGHT = "#c9cfe8";
const DARK = "#1b2240";
const MID = "#39406a";

/** Small pixel illustration of a single component for picker cards. */
export function PartVisual({ component: c, className }: { component: GameComponent; className?: string }) {
  const { els, r } = pixelCanvas();
  const accent = RARITY_COLORS[c.rarity];

  switch (c.category) {
    case "case": {
      const m = c.metadata;
      const [w, h] = m.size === "MINI" ? [16, 18] : m.size === "MID" ? [18, 24] : [20, 28];
      const x = 24 - w / 2, y = 30 - h;
      r(x, y, w, h, shade(m.trim, -0.2));
      r(x + 1, y + 1, w - 2, h - 2, m.color);
      if (m.glass) {
        r(x + 2, y + 3, w - 8, h - 6, "#0a1029");
        r(x + 3, y + h - 9, w - 11, 2, accent);
        r(x + 3, y + 5, 4, 4, "#aeb6d6");
      } else {
        for (let i = 0; i < 4; i++) r(x + 3, y + 4 + i * 3, w - 8, 1, shade(m.color, -0.25));
      }
      r(x + w - 4, y + 2, 2, h - 4, shade(m.color, -0.15));
      r(x + w - 4, y + 3, 2, 2, accent);
      break;
    }
    case "cpu": {
      for (let i = 0; i < 6; i++) {
        r(15 + i * 3, 3, 1, 3, "#f7d58b");
        r(15 + i * 3, 26, 1, 3, "#f7d58b");
      }
      r(12, 6, 24, 20, MID);
      r(13, 7, 22, 18, LIGHT);
      r(18, 11, 12, 10, accent);
      r(20, 13, 8, 6, shade(accent, -0.35));
      break;
    }
    case "gpu": {
      const len = Math.round((c.metadata.length / 400) * 40);
      const x = 24 - len / 2;
      r(x - 2, 8, 2, 18, "#8a93b8");
      r(x, 9, len, 15, DARK);
      r(x, 9, len, 2, accent);
      r(x, 22, len, 2, shade(accent, -0.4));
      const step = len / c.metadata.fans;
      for (let i = 0; i < c.metadata.fans; i++) {
        const fx = Math.round(x + step * i + step / 2 - 4);
        r(fx, 12, 8, 8, "#0a0f22");
        r(fx + 2, 14, 4, 4, MID);
        r(fx + 3, 15, 2, 2, LIGHT);
      }
      r(x + 4, 25, Math.min(14, len - 8), 2, "#f7d58b");
      break;
    }
    case "motherboard": {
      const [w, h] = { ITX: [22, 22], MATX: [26, 24], ATX: [30, 26], EATX: [36, 27] }[c.metadata.formFactor];
      const x = 24 - w / 2, y = 16 - h / 2;
      r(x, y, w, h, "#16244a");
      r(x + 1, y + 1, w - 2, h - 2, "#1f3263");
      r(x + 3, y + 3, 8, 8, LIGHT);
      r(x + 5, y + 5, 4, 4, accent);
      const slots = c.metadata.ramType === "DDR5" ? 4 : 2;
      for (let i = 0; i < slots; i++) r(x + 13 + i * 2, y + 3, 1, 9, "#5a6390");
      for (let i = 0; i < c.metadata.m2Slots; i++) r(x + 3, y + 14 + i * 3, w - 8, 1, "#5eb0ff");
      r(x + w - 4, y + 3, 2, h - 6, "#2f4a7a");
      break;
    }
    case "ram": {
      const n = c.metadata.sticks;
      for (let i = 0; i < n; i++) {
        const x = 24 - (n * 7) / 2 + i * 7;
        r(x, 5, 5, 22, MID);
        r(x + 1, 6, 3, 20, c.metadata.ramType === "DDR5" ? "#2a3a72" : "#2c3458");
        r(x, 5, 5, 3, accent);
        for (let j = 0; j < 4; j++) r(x + 1, 11 + j * 4, 3, 2, "#0f1838");
        r(x, 27, 5, 1, "#f7d58b");
      }
      break;
    }
    case "storage": {
      if (c.metadata.interface === "NVME") {
        r(6, 12, 36, 8, "#16244a");
        r(7, 13, 34, 6, "#1f3263");
        for (let i = 0; i < 3; i++) r(10 + i * 9, 14, 7, 4, "#0a0f22");
        r(39, 14, 2, 4, "#f7d58b");
        r(7, 13, 34, 1, accent);
      } else if (c.metadata.readMbs < 300) {
        r(12, 6, 24, 20, MID);
        r(13, 7, 22, 18, LIGHT);
        r(17, 9, 14, 14, "#8a93b8");
        r(23, 15, 2, 2, DARK);
        r(28, 21, 6, 1, accent);
      } else {
        r(12, 8, 24, 16, MID);
        r(13, 9, 22, 14, DARK);
        r(15, 11, 18, 6, accent);
        r(15, 19, 8, 1, LIGHT);
      }
      break;
    }
    case "psu": {
      r(9, 7, 30, 20, MID);
      r(10, 8, 28, 18, DARK);
      r(13, 10, 14, 14, "#0a0f22");
      for (let i = 0; i < 4; i++) r(14, 11 + i * 3, 12, 1, "#5a6390");
      r(30, 10, 5, 2, accent);
      const bar = Math.round((c.metadata.wattage / 1600) * 12);
      r(29, 22 - bar, 6, bar, accent, { opacity: 0.7 });
      break;
    }
    case "cooling": {
      const m = c.metadata;
      if (m.type === "AIR") {
        const h = (m.height ?? 60) > 150 ? 24 : (m.height ?? 60) > 100 ? 20 : 8;
        const y = 30 - h - 1;
        r(14, y, 16, h, "#aeb6d6");
        for (let j = 0; j < h / 2; j++) r(14, y + 1 + j * 2, 16, 1, "#7c86ad");
        r(30, y, 5, h, MID);
        r(31, y + h / 2 - 3, 3, 6, accent);
        if ((m.height ?? 0) > 165) {
          r(8, y, 5, h, "#aeb6d6");
          for (let j = 0; j < h / 2; j++) r(8, y + 1 + j * 2, 5, 1, "#7c86ad");
        }
      } else {
        const fans = Math.round((m.radiator ?? 240) / 120);
        const w = fans * 11 + 2;
        const x = 24 - w / 2;
        r(x, 4, w, 10, MID);
        for (let i = 0; i < fans; i++) {
          r(x + 2 + i * 11, 5, 9, 8, "#0a0f22");
          r(x + 5 + i * 11, 8, 3, 2, LIGHT);
        }
        const tube = m.type === "CUSTOM" ? accent : MID;
        r(20, 14, 2, 8, tube);
        r(26, 14, 2, 8, tube);
        r(17, 21, 14, 9, DARK);
        r(19, 23, 10, 5, accent);
      }
      break;
    }
    case "monitor": {
      const m = c.metadata;
      const [w, h] = m.crt ? [24, 20] : m.ultrawide ? [44, 14] : [Math.round(m.sizeIn * 1.15), Math.round(m.sizeIn * 0.68)];
      const x = Math.round(24 - w / 2), y = 25 - h;
      const bezel = m.crt ? "#e8d9b8" : DARK;
      r(x, y, w, h, shade(bezel, -0.3));
      r(x + 1, y + 1, w - 2, h - 2, bezel);
      r(x + 2, y + 2, w - 4, h - (m.crt ? 6 : 4), "#2a2470");
      r(x + 2, y + h - (m.crt ? 7 : 5), w - 4, 2, accent);
      if (m.crt) r(18, 25, 12, 3, shade(bezel, -0.15));
      else {
        r(22, 25, 4, 3, MID);
        r(17, 28, 14, 2, MID);
      }
      break;
    }
    case "keyboard": {
      const m = c.metadata;
      const w = m.layout === "FULL" ? 42 : m.layout === "TKL" ? 34 : 26;
      const x = 24 - w / 2;
      const base = m.retro ? "#e8d9b8" : DARK;
      r(x, 10, w, 13, shade(base, -0.35));
      r(x, 10, w, 12, base);
      for (let row = 0; row < 4; row++)
        for (let col = 0; col < (w - 2) / 3; col++) r(x + 1 + col * 3 + (row % 2), 11 + row * 3, 2, 2, m.rgb ? (col + row) % 3 ? accent : "#7fd8ff" : m.retro ? "#9c8a64" : "#5a6390");
      break;
    }
    case "mouse": {
      r(18, 6, 12, 22, "#0d1230");
      r(19, 6, 10, 20, "#262e58");
      r(23, 6, 1, 8, "#0d1230");
      r(23, 8, 1, 3, c.metadata.rgb ? accent : "#5a6390");
      r(21, 20, 6, 2, accent, { opacity: 0.8 });
      if (c.metadata.wireless) {
        r(33, 8, 1, 1, LIGHT);
        r(35, 6, 1, 5, LIGHT);
      }
      break;
    }
  }

  return (
    <svg viewBox="0 0 48 32" className={className} shapeRendering="crispEdges" aria-hidden>
      {els}
    </svg>
  );
}
