import type { Metadata } from "next";
import Link from "next/link";
import { ChallengeCard } from "@/components/community/ChallengeCard";
import { EntryForm } from "@/components/community/EntryForm";
import { OfflineNotice } from "@/components/community/OfflineNotice";
import { BuildCard } from "@/components/pc/BuildCard";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { RarityBadge } from "@/components/ui/PixelBadge";
import { PixelButton } from "@/components/ui/PixelButton";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { EmptyState } from "@/components/ui/States";
import { getChallengeEntries, getMyEntry, getTodayChallenge, getUserBuilds, getViewer } from "@/lib/db/queries";
import { checkChallenge, evaluateSelection } from "@/lib/pc-engine";
import { pad2 } from "@/lib/utils";

export const metadata: Metadata = { title: "Daily challenges", description: "A new RH PC LAB build challenge every day." };

export default async function ChallengesPage() {
  const [challenge, viewer] = await Promise.all([getTodayChallenge(), getViewer()]);
  const [entries, mine, myBuilds] = await Promise.all([
    getChallengeEntries(challenge.id),
    viewer ? getMyEntry(challenge.id, viewer.id) : null,
    viewer ? getUserBuilds(viewer.id, 50) : [],
  ]);
  const options = myBuilds.filter((b) => b.isPublic).map((b) => ({ id: b.id, name: b.name, score: b.score, fails: checkChallenge(challenge.rules, evaluateSelection(b.selection)) }));

  return (
    <div className="page-enter mx-auto flex max-w-6xl flex-col gap-6">
      <OfflineNotice />
      <RetroWindow title="DAILY_CHALLENGE.EXE" tag="RH" footerLeft="One entry per builder per day" footerRight="Resets 00:00 UTC">
        <h1 className="sr-only">Daily challenges</h1>
        <ChallengeCard challenge={challenge}>
          <div className="mt-6 flex flex-wrap gap-3">
            <PixelButton href="/builder" variant="mint">[ BUILD FOR THIS CHALLENGE ]</PixelButton>
          </div>
        </ChallengeCard>
      </RetroWindow>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <RetroWindow title="TOP_BUILDS.DAT" footerLeft={`${entries.length} entries`}>
          <h2 className="mb-4 text-2xl font-bold tracking-wide">TOP BUILDS</h2>
          {entries.length ? (
            <ol className="divide-y divide-dashed divide-line border border-line">
              {entries.map((e, i) => (
                <li key={e.id}>
                  <Link href={`/build/${e.build.id}`} className="flex items-center gap-3 px-3 py-2.5 hover:bg-navy-700/60">
                    <span className={`w-8 text-xl font-bold ${i === 0 ? "text-gold" : i < 3 ? "text-lilac" : "text-faint"}`}>{pad2(i + 1)}</span>
                    <PixelAvatar id={e.build.owner.avatar} size={26} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">{e.build.name}</span>
                      <span className="block truncate text-xs text-dim">@{e.build.owner.username}</span>
                    </span>
                    <RarityBadge rarity={e.build.rarity} />
                    <span className="w-10 text-right text-xl font-bold text-mint">{e.build.score}</span>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState title="NO ENTRIES YET" message="Today's board is wide open. Claim the top spot." action={{ href: "/builder", label: "BUILD YOUR PC" }} />
          )}
        </RetroWindow>

        <RetroWindow title="MY_ENTRY.SAV" footerLeft={viewer ? `@${viewer.username}` : "Guest"}>
          <h2 className="mb-4 text-2xl font-bold tracking-wide">MY ENTRY</h2>
          {!viewer ? (
            <EmptyState title="LOG IN TO ENTER" message="Save a build with your email account, then submit it here." action={{ href: "/login?next=/challenges", label: "LOG IN" }} />
          ) : (
            <div className="flex flex-col gap-4">
              {mine ? <BuildCard build={mine.build} /> : null}
              {options.length ? (
                <EntryForm options={options} currentId={mine?.build.id} />
              ) : (
                <EmptyState title="NO PUBLIC RIGS" message="Save a public build that meets today's rules first." action={{ href: "/builder", label: "BUILD YOUR PC" }} />
              )}
            </div>
          )}
        </RetroWindow>
      </div>
    </div>
  );
}
