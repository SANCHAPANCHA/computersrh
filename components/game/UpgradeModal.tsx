"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PartVisual } from "@/components/pc/PartVisual";
import { RarityBadge } from "@/components/ui/PixelBadge";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { PixelModal } from "@/components/ui/PixelModal";
import { useToast } from "@/components/ui/PixelToast";
import type { GameConfig } from "@/data/economy";
import { upgradeComponent } from "@/lib/game/actions";
import { getComponent } from "@/lib/pc-engine/catalog";
import { leveled } from "@/lib/pc-engine/levels";
import { play } from "@/lib/sound";
import type { GameComponent } from "@/types/game";
import { LevelPips } from "./Bits";

export function statLines(c: GameComponent): [string, string][] {
  const out: [string, string][] = [["PERFORMANCE", String(c.performance)]];
  if (c.power) out.push(["POWER", `${c.power}W`]);
  if (c.category === "psu") out.push(["WATTAGE", `${c.metadata.wattage}W`]);
  if (c.category === "cooling") out.push(["MAX TDP", `${c.metadata.maxTdp}W`]);
  if (c.category === "case") out.push(["AIRFLOW", String(c.metadata.airflow)]);
  return out;
}

interface Props {
  componentId: string | null;
  level: number;
  upgrades: GameConfig["upgrades"];
  onClose: () => void;
}

export function UpgradeModal({ componentId, level, upgrades, onClose }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [doneLevel, setDoneLevel] = useState<number | null>(null);
  const base = getComponent(componentId);
  if (!base) return null;
  const from = leveled(base, level, upgrades);
  const to = leveled(base, level + 1, upgrades);
  const before = statLines(from);
  const after = statLines(to);

  async function confirm() {
    setBusy(true);
    const res = await upgradeComponent(base!.id);
    setBusy(false);
    if (!res.ok) {
      play("error");
      return toast({ tone: "error", title: "UPGRADE FAILED", message: res.error });
    }
    play("success");
    setDoneLevel(res.level);
    toast({ tone: "achievement", title: `${base!.name.toUpperCase()} → LEVEL ${res.level}`, message: res.score !== null ? `PC score now ${res.score}` : undefined });
    router.refresh();
  }

  const close = () => {
    setDoneLevel(null);
    onClose();
  };

  return (
    <PixelModal open={Boolean(componentId)} onClose={close} title="UPGRADE.EXE" footerLeft="Uses 1 duplicate copy">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="grid h-24 w-36 place-items-center border border-line bg-navy-950" style={doneLevel ? { animation: "reveal-flash 0.8s steps(8, end) both" } : undefined}>
          <PartVisual component={doneLevel ? to : from} className="h-20 w-32" />
        </div>
        <div>
          <RarityBadge rarity={base.rarity} />
          <h3 className="h-display mt-2 text-3xl">{base.name}</h3>
        </div>
        <div className="flex items-center gap-3 text-2xl font-bold">
          <span className={doneLevel ? "text-dim" : "text-ink"}>LEVEL {level}</span>
          <PixelIcon name="arrow" size={16} className="text-mint" />
          <span className="text-gold">LEVEL {level + 1}</span>
        </div>
        <LevelPips level={doneLevel ?? level} max={upgrades.maxLevel} />
        <table className="w-full max-w-xs text-sm">
          <tbody>
            {after.map(([k, v], i) => (
              <tr key={k} className="border-b border-dashed border-line">
                <td className="px-stat-label py-1.5 text-left">{k}</td>
                <td className="py-1.5 text-right tabular-nums text-dim">{before[i]?.[1]}</td>
                <td className="w-6 py-1.5 text-center text-mint">→</td>
                <td className="py-1.5 text-right font-bold tabular-nums text-mint">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {doneLevel ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-display text-2xl text-mint" style={{ animation: "pop 0.4s steps(4, end)" }}>UPGRADE COMPLETE</div>
            <button type="button" className="px-btn px-btn-sm" onClick={close}>[ DONE ]</button>
          </div>
        ) : (
          <button type="button" className="px-btn px-btn-mint w-full" disabled={busy} onClick={confirm}>
            <PixelIcon name="up" size={12} /> {busy ? "FUSING..." : "[ CONFIRM UPGRADE ]"}
          </button>
        )}
      </div>
    </PixelModal>
  );
}
