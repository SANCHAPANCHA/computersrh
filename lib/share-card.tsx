import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { PcVisualizer } from "@/components/pc/PcVisualizer";
import type { BuildSummary } from "@/lib/pc-engine";
import { RARITY_COLORS } from "@/lib/pc-engine/rarity";
import { formatValue } from "@/lib/pc-engine/value";
import type { RgbColor } from "@/types/game";

export const CARD_SIZE = { width: 1200, height: 630 };

let fontCache: Promise<{ name: string; data: Buffer; weight: 400 | 700; style: "normal" }[]> | null = null;
function fonts() {
  const dir = join(process.cwd(), "assets/fonts");
  fontCache ??= Promise.all([
    readFile(join(dir, "PixelifySans-Regular.ttf")).then((data) => ({ name: "Pixelify", data, weight: 400 as const, style: "normal" as const })),
    readFile(join(dir, "PixelifySans-Bold.ttf")).then((data) => ({ name: "Pixelify", data, weight: 700 as const, style: "normal" as const })),
    readFile(join(dir, "Silkscreen-Regular.ttf")).then((data) => ({ name: "Silkscreen", data, weight: 400 as const, style: "normal" as const })),
  ]);
  return fontCache;
}

interface CardProps {
  summary: BuildSummary;
  rgb: RgbColor;
  name: string;
  by?: string | null;
  number?: number | null;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", marginBottom: 10, flexShrink: 0 }}>
      <div style={{ display: "flex", fontFamily: "Silkscreen", fontSize: 15, color: "#a8b0d6", letterSpacing: 2 }}>{label}</div>
      <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#eef0ff" }}>{value}</div>
    </div>
  );
}

/** Satori-safe share card layout (every multi-child div is flex). */
function Card({ summary, rgb, name, by, number }: CardProps) {
  const color = RARITY_COLORS[summary.rarity];
  const p = summary.parts;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#1a1b4e", padding: 28, fontFamily: "Pixelify" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f6d8ce", padding: "0 18px 14px", boxShadow: "inset -6px -6px 0 #d9a5aa, inset 5px 5px 0 #fffaf4" }}>
        <div style={{ display: "flex", alignItems: "center", height: 62 }}>
          <div style={{ display: "flex", width: 24, height: 24, background: "#f25c7a", marginRight: 12 }} />
          <div style={{ display: "flex", width: 24, height: 24, background: "#f5a63a", marginRight: 12 }} />
          <div style={{ display: "flex", width: 24, height: 24, background: "#34d38f", marginRight: 20 }} />
          <div style={{ display: "flex", fontSize: 26, color: "#4a4170" }}>{number ? `BUILD #${number}` : "RIG_CARD.PNG"}</div>
          <div style={{ marginLeft: "auto", fontSize: 30, fontWeight: 700, color: "#3b3466", display: "flex" }}>
            RH PC <span style={{ background: "#3ce6b0", color: "#0b1330", padding: "0 8px", marginLeft: 8 }}>LAB</span>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", background: "#0f1838", border: "3px solid #070c22", padding: 22 }}>
          <div style={{ display: "flex", width: 640, height: 397, border: "2px solid #2c3866", alignSelf: "center" }}>
            <PcVisualizer parts={p} rgb={rgb} width={636} height={393} />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingLeft: 30 }}>
            <div style={{ display: "flex" }}>
              <div style={{ display: "flex", fontFamily: "Silkscreen", fontSize: 20, color: "#0b1330", background: color, padding: "4px 10px", letterSpacing: 2 }}>{summary.rarity}</div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", marginTop: 6, flexShrink: 0 }}>
              <div style={{ display: "flex", fontSize: 100, fontWeight: 700, color, lineHeight: 1 }}>{summary.score.total}</div>
              <div style={{ display: "flex", fontSize: 34, color: "#a8b0d6", marginLeft: 10, marginBottom: 12 }}>/ 100</div>
            </div>
            <div style={{ fontSize: 26, color: "#f0b6d6", marginTop: 8, marginBottom: 14, lineHeight: 1.2, display: "flex", flexShrink: 0 }}>{name}</div>
            <Row label="CPU" value={p.cpu?.name ?? "—"} />
            <Row label="GPU" value={p.gpu?.name ?? "—"} />
            <Row label="RAM" value={p.ram?.name ?? "—"} />
            <div style={{ display: "flex", marginTop: "auto", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontFamily: "Silkscreen", fontSize: 16, color: "#a8b0d6", letterSpacing: 2 }}>BUILT BY</div>
                <div style={{ display: "flex", fontSize: 28, color: "#3ce6b0" }}>{by ? `@${by}` : "a lab guest"}</div>
              </div>
              <div style={{ display: "flex", fontSize: 26, color: "#f7d58b" }}>{formatValue(summary.value)}</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 18, color: "#5b5384" }}>
          <div>Unofficial community project inspired by Computers RH</div>
          <div>Build. Customize. Score. Share.</div>
        </div>
      </div>
    </div>
  );
}

export async function renderShareCard(props: CardProps, headers?: Record<string, string>) {
  return new ImageResponse(<Card {...props} />, { ...CARD_SIZE, fonts: await fonts(), headers });
}
