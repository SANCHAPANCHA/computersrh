import type { Metadata } from "next";
import { BuildActions } from "@/components/community/BuildActions";
import { BuildDetail } from "@/components/pc/BuildDetail";
import { ErrorPanel } from "@/components/ui/States";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { decodeSelection, encodeSelection, evaluateSelection, parseRgb, sanitizeBuildName } from "@/lib/pc-engine";
import { siteUrl } from "@/lib/site";

function read(sp: Record<string, string | string[] | undefined>) {
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : null);
  const selection = decodeSelection(s("parts"));
  const by = s("by");
  return { selection, rgb: parseRgb(s("rgb")), name: sanitizeBuildName(s("name")), by: by && /^[a-z0-9_]{3,20}$/i.test(by) ? by : null };
}

export async function generateMetadata({ searchParams }: PageProps<"/share">): Promise<Metadata> {
  const d = read(await searchParams);
  const s = evaluateSelection(d.selection);
  const img = `/api/card?parts=${encodeSelection(d.selection)}&rgb=${d.rgb}&name=${encodeURIComponent(d.name)}${d.by ? `&by=${d.by}` : ""}`;
  const title = `${d.name} · ${s.score.total}/100 ${s.rarity}`;
  return { title, openGraph: { title, images: [img] }, twitter: { card: "summary_large_image", title, images: [img] } };
}

export default async function SharePage({ searchParams }: PageProps<"/share">) {
  const d = read(await searchParams);
  const s = evaluateSelection(d.selection);
  if (!s.complete) {
    return (
      <div className="mx-auto max-w-2xl">
        <RetroWindow title="ERROR.EXE">
          <ErrorPanel code="404" title="SYSTEM NOT FOUND" message="This share link is incomplete. Looks like this PC doesn't exist." action={{ href: "/builder", label: "BACK TO LAB" }} />
        </RetroWindow>
      </div>
    );
  }
  const enc = encodeSelection(d.selection);
  const qs = `parts=${enc}&rgb=${d.rgb}&name=${encodeURIComponent(d.name)}${d.by ? `&by=${d.by}` : ""}`;
  return (
    <BuildDetail
      title="SHARED_RIG.EXE"
      heading={d.by ? `SHARED RIG · BY @${d.by}` : "SHARED RIG"}
      name={d.name}
      owner={null}
      selection={d.selection}
      rgb={d.rgb}
      actions={<BuildActions score={s.score.total} shareUrl={`${siteUrl()}/share?${qs}`} cardUrl={`/api/card?${qs}`} similarHref={`/builder?parts=${enc}&rgb=${d.rgb}`} saved={false} />}
    />
  );
}
