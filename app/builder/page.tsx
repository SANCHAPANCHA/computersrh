import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Builder } from "@/components/builder/Builder";
import { getViewer } from "@/lib/db/queries";
import { getGameConfig } from "@/lib/game/config";
import { getPlayerState } from "@/lib/game/queries";
import { decodeSelection, parseRgb } from "@/lib/pc-engine/encode";
import { sanitizeBuildName } from "@/lib/pc-engine/validation";

export const metadata: Metadata = { title: "Builder", description: "Pick parts, check compatibility and score your dream rig." };

export default async function BuilderPage({ searchParams }: PageProps<"/builder">) {
  const sp = await searchParams;
  if (sp.mode === "rig") {
    const viewer = await getViewer();
    if (!viewer) redirect("/login?next=/builder?mode=rig");
    const cfg = await getGameConfig();
    const state = await getPlayerState(viewer.id, cfg);
    if (!state) redirect("/dashboard");
    return (
      <Builder
        fromUrl
        initial={{ selection: state.rig?.parts ?? {}, name: `@${viewer.username}'s PC`, assisted: true }}
        rig={{
          credits: state.credits,
          levels: state.levels,
          spares: Object.fromEntries(state.inventory.map((i) => [i.componentId, i.spare])),
          unbuyable: cfg.shop.unbuyable,
          priceMultiplier: cfg.shop.priceMultiplier,
          upgrades: cfg.upgrades,
          hasRig: Boolean(state.rig),
        }}
      />
    );
  }
  const raw = typeof sp.parts === "string" ? sp.parts : undefined;
  const selection = decodeSelection(raw);
  const fromUrl = Object.keys(selection).length > 0;
  const name = typeof sp.name === "string" ? sanitizeBuildName(sp.name) : undefined;
  return (
    <Builder
      fromUrl={fromUrl}
      initial={fromUrl ? { selection, rgb: parseRgb(typeof sp.rgb === "string" ? sp.rgb : null), assisted: true, step: 0, ...(name ? { name: `${name}`.slice(0, 32) } : {}) } : {}}
    />
  );
}
