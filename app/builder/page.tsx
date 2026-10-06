import type { Metadata } from "next";
import { Builder } from "@/components/builder/Builder";
import { decodeSelection, parseRgb } from "@/lib/pc-engine/encode";
import { sanitizeBuildName } from "@/lib/pc-engine/validation";

export const metadata: Metadata = { title: "Builder", description: "Pick parts, check compatibility and score your dream rig." };

export default async function BuilderPage({ searchParams }: PageProps<"/builder">) {
  const sp = await searchParams;
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
