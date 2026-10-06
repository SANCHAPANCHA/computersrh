import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AchievementGrid } from "@/components/community/AchievementGrid";
import { BuildCard } from "@/components/pc/BuildCard";
import { PcVisualizer } from "@/components/pc/PcVisualizer";
import { RarityBadge } from "@/components/ui/PixelBadge";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { StatBox } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { EmptyState } from "@/components/ui/States";
import { getProfileByUsername, getUnlockedAchievements, getUserBuilds, getViewer } from "@/lib/db/queries";
import { getComponent, resolveSelection } from "@/lib/pc-engine/catalog";
import { RARITY_COLORS } from "@/lib/pc-engine/rarity";
import { builderTitle } from "@/lib/titles";

export async function generateMetadata({ params }: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${decodeURIComponent(username)}` };
}

export default async function ProfilePage({ params }: PageProps<"/u/[username]">) {
  const { username } = await params;
  const profile = await getProfileByUsername(decodeURIComponent(username));
  if (!profile) notFound();
  const [all, unlocked, viewer] = await Promise.all([getUserBuilds(profile.id), getUnlockedAchievements(profile.id), getViewer()]);
  const isMe = viewer?.id === profile.id;
  const builds = isMe ? all : all.filter((b) => b.isPublic);
  const best = [...builds].sort((a, b) => b.score - a.score)[0];
  const likes = builds.reduce((s, b) => s + b.likes, 0);
  const fav = getComponent(profile.favoriteComponent);
  const title = builderTitle(best?.score ?? 0, builds.length);

  return (
    <div className="page-enter mx-auto flex max-w-6xl flex-col gap-6">
      <RetroWindow title={`PROFILE_${profile.username.toUpperCase()}.EXE`} footerLeft={`Member since ${new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}>
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <PixelAvatar id={profile.avatar} size={112} className="shadow-[6px_6px_0_#070c22]" />
          <div className="min-w-0 flex-1">
            <h1 className="h-display text-4xl break-all sm:text-5xl">@{profile.username.toUpperCase()}</h1>
            <div className="kicker mt-2">✧ {title}</div>
            {profile.bio ? <p className="read mt-3 max-w-xl text-sm text-dim">{profile.bio}</p> : null}
            {fav ? <p className="mt-2 text-xs text-faint">Favourite part: <span className="text-lilac">{fav.name}</span></p> : null}
          </div>
          {isMe ? <PixelButton href="/settings" variant="ghost" size="sm">EDIT PROFILE</PixelButton> : null}
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatBox label="BUILDS" value={builds.length} />
          <StatBox label="BEST SCORE" value={best?.score ?? "—"} accent="mint" />
          <StatBox label="LIKES" value={likes} accent="pink" />
        </div>
      </RetroWindow>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <RetroWindow title="ACHIEVEMENTS.DAT">
          <h2 className="mb-4 text-2xl font-bold">ACHIEVEMENTS</h2>
          {Object.keys(unlocked).length ? null : <p className="mb-3 text-sm text-dim">NO ACHIEVEMENTS YET — Start building.</p>}
          <AchievementGrid unlocked={unlocked} compact />
        </RetroWindow>
        <RetroWindow title="FEATURED_RIG.SAV">
          <h2 className="mb-4 text-2xl font-bold">FEATURED RIG</h2>
          {best ? (
            <a href={`/build/${best.id}`} className="block border border-line bg-navy-950 hover:border-line-strong">
              <PcVisualizer parts={resolveSelection(best.selection)} rgb={best.rgb} animated label={best.name} />
              <div className="flex items-center justify-between gap-3 border-t border-line p-3">
                <span className="truncate font-bold">{best.name}</span>
                <span className="flex items-center gap-2">
                  <RarityBadge rarity={best.rarity} />
                  <span className="text-2xl font-bold" style={{ color: RARITY_COLORS[best.rarity] }}>{best.score}<span className="text-sm text-dim"> / 100</span></span>
                </span>
              </div>
            </a>
          ) : (
            <EmptyState title="NO RIGS FOUND" message="Be the first one to boot a PC." action={isMe ? { href: "/builder", label: "BUILD YOUR PC" } : undefined} />
          )}
        </RetroWindow>
      </div>

      <RetroWindow title="BUILDS.DIR" footerLeft={`${builds.length} rigs`}>
        <h2 className="mb-4 text-2xl font-bold">{isMe ? "MY BUILDS" : "BUILDS"}</h2>
        {builds.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{builds.map((b) => <BuildCard key={b.id} build={b} />)}</div>
        ) : (
          <EmptyState title="NO RIGS FOUND" message="Be the first one to boot a PC." action={isMe ? { href: "/builder", label: "BUILD YOUR PC" } : undefined} />
        )}
      </RetroWindow>
    </div>
  );
}
