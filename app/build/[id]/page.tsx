import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BuildActions, OwnerControls } from "@/components/community/BuildActions";
import { BuildDetail } from "@/components/pc/BuildDetail";
import { Notice } from "@/components/ui/States";
import { getBuild, getViewer, hasLiked } from "@/lib/db/queries";
import { encodeSelection } from "@/lib/pc-engine/encode";
import { siteUrl } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/build/[id]">): Promise<Metadata> {
  const b = await getBuild((await params).id);
  if (!b) return { title: "System not found" };
  const title = `${b.name} · ${b.score}/100 ${b.rarity}`;
  return { title, description: `A ${b.rarity} rig by @${b.owner.username} on RH PC LAB.`, openGraph: { title }, twitter: { card: "summary_large_image", title } };
}

export default async function BuildPage({ params, searchParams }: PageProps<"/build/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const [build, viewer] = await Promise.all([getBuild(id), getViewer()]);
  if (!build) notFound();
  const liked = await hasLiked(build.id, viewer?.id);
  const isOwner = viewer?.id === build.owner.id;
  const enc = encodeSelection(build.selection);
  const shareUrl = `${siteUrl()}/build/${build.id}`;
  const cardUrl = `/api/card?parts=${enc}&rgb=${build.rgb}&name=${encodeURIComponent(build.name)}&by=${build.owner.username}&n=${build.number}`;

  return (
    <div className="flex flex-col gap-6">
      <BuildDetail
        title={`BUILD_${String(build.number).padStart(4, "0")}.EXE`}
        heading={`BUILD #${build.number}${build.isPublic ? "" : " · PRIVATE"}`}
        name={build.name}
        owner={build.owner}
        selection={build.selection}
        rgb={build.rgb}
        chaos={build.chaos}
        footerRight={<>♥ {build.likes} likes</>}
        notice={sp.new ? <Notice tone="success" title="BUILD SAVED">Your rig is live. Share it with the world!</Notice> : null}
        actions={<BuildActions buildId={build.id} likes={build.likes} liked={liked} score={build.score} shareUrl={shareUrl} cardUrl={cardUrl} similarHref={`/builder?parts=${enc}&rgb=${build.rgb}`} discussHref={build.isPublic ? `/community/new?build=${build.id}` : undefined} saved />}
      />
      {isOwner ? (
        <div className="mx-auto w-full max-w-5xl">
          <OwnerControls buildId={build.id} name={build.name} isPublic={build.isPublic} />
        </div>
      ) : null}
    </div>
  );
}
