import { ChallengeCard } from "@/components/community/ChallengeCard";
import { LeaderboardList } from "@/components/community/LeaderboardList";
import { HeroRig } from "@/components/home/HeroRig";
import { BuildCard } from "@/components/pc/BuildCard";
import { PresetCard } from "@/components/pc/PresetCard";
import { SectionHeading } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { EmptyState } from "@/components/ui/States";
import { COMPONENTS } from "@/data/components";
import { PRESETS } from "@/data/presets";
import { getLeaderboard, getTodayChallenge, listBuilds } from "@/lib/db/queries";
import { COMPUTERS_RH_URL, DISCLAIMER } from "@/lib/site";

const STEPS = [
  { n: "01", title: "PICK YOUR PARTS", text: `${COMPONENTS.length} fictional parts across 11 categories, from Common to Mythic.`, icon: "cpu" },
  { n: "02", title: "BUILD YOUR RIG", text: "Watch your pixel PC come together. The compatibility engine flags conflicts.", icon: "wrench" },
  { n: "03", title: "GET YOUR SCORE", text: "Boot it up for a 0–100 score across compute, graphics, memory and more.", icon: "bolt" },
  { n: "04", title: "SHARE IT", text: "Save with email, get a public build page and a share card for X.", icon: "star" },
];

export default async function Home() {
  const [featured, leaders, challenge] = await Promise.all([listBuilds("top", 4), getLeaderboard("score", 5), getTodayChallenge()]);

  return (
    <div className="page-enter mx-auto flex max-w-6xl flex-col gap-20 sm:gap-24">
      {/* HERO */}
      <section className="grid items-center gap-10 pt-2 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div>
          <div className="kicker mb-4">✧ COMMUNITY PC LAB · SEASON 01</div>
          <h1 className="h-display text-6xl text-cream sm:text-7xl lg:text-8xl">
            RH PC <span className="text-mint">LAB</span>
          </h1>
          <p className="h-display mt-4 text-3xl text-pink sm:text-4xl">BUILD YOUR DREAM RIG.</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {["Build.", "Customize.", "Score.", "Share."].map((w, i) => (
              <li key={w} className="border border-line-strong bg-navy-900/70 px-2.5 py-2 text-sm">
                <span className="mr-1 text-xs text-faint">0{i + 1}</span>
                {w}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-4">
            <PixelButton href="/builder" variant="mint" size="lg">
              [ START BUILDING ]
            </PixelButton>
            <PixelButton href="/explore" size="lg">
              [ EXPLORE BUILDS ]
            </PixelButton>
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-dim">
            <PixelIcon name="sparkle" size={10} className="text-lilac" />
            {DISCLAIMER}
          </p>
        </div>
        <HeroRig />
      </section>

      {/* HOW IT WORKS */}
      <section aria-labelledby="how">
        <RetroWindow title="HOW_IT_WORKS.TXT" footerLeft="No account needed to start building">
          <h2 id="how" className="h-display mb-6 text-center text-3xl sm:text-4xl">HOW IT WORKS</h2>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.n} className={i === 0 ? "px-panel px-panel-accent p-4" : "px-panel p-4"}>
                <div className="flex items-center gap-3">
                  <span className={i === 0 ? "grid h-8 w-8 place-items-center bg-mint font-bold text-navy-900" : "grid h-8 w-8 place-items-center border border-line-strong font-bold text-lilac"}>{s.n}</span>
                  <PixelIcon name={s.icon} size={18} className="ml-auto text-lilac" />
                </div>
                <h3 className="mt-4 text-lg font-bold tracking-wide">{s.title}</h3>
                <p className="mt-1.5 text-sm text-dim">{s.text}</p>
              </li>
            ))}
          </ol>
        </RetroWindow>
      </section>

      {/* FEATURED */}
      <section aria-labelledby="featured">
        <SectionHeading kicker={featured.length ? "COMMUNITY" : "LAB PRESETS"} title="FEATURED BUILDS">
          <PixelButton href="/explore" variant="ghost" size="sm">
            VIEW ALL <PixelIcon name="arrow" size={10} />
          </PixelButton>
        </SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.length ? featured.map((b) => <BuildCard key={b.id} build={b} />) : PRESETS.map((p) => <PresetCard key={p.key} preset={p} />)}
        </div>
      </section>

      {/* LEADERBOARD + CHALLENGE */}
      <section className="grid gap-8 lg:grid-cols-[1fr_1.35fr]">
        <RetroWindow title="LEADERBOARD.DAT" footerLeft="Top score · public builds" footerRight={<a className="hover:underline" href="/leaderboard">Full board →</a>}>
          <h2 className="h-display mb-4 text-3xl">LEADERBOARD</h2>
          {leaders.length ? (
            <LeaderboardList rows={leaders} metric="bestScore" />
          ) : (
            <EmptyState title="NO RIGS FOUND" message="Be the first one to boot a PC." action={{ href: "/builder", label: "BUILD YOUR PC" }} />
          )}
        </RetroWindow>
        <RetroWindow title="DAILY_CHALLENGE.EXE" tag="RH" footerLeft="Resets daily at 00:00 UTC" footerRight={<a className="hover:underline" href="/challenges">Enter →</a>}>
          <h2 className="sr-only">DAILY CHALLENGE</h2>
          <ChallengeCard challenge={challenge}>
            <PixelButton href="/challenges" variant="mint" className="mt-6">
              [ TAKE THE CHALLENGE ]
            </PixelButton>
          </ChallengeCard>
        </RetroWindow>
      </section>

      {/* ABOUT */}
      <section aria-labelledby="about">
        <RetroWindow title="ABOUT.TXT" footerLeft="Off-chain · email accounts only">
          <div className="grid gap-6 md:grid-cols-[1fr_1.3fr] md:items-center">
            <div>
              <div className="kicker mb-2">✧ ABOUT</div>
              <h2 id="about" className="h-display text-3xl sm:text-4xl">A LAB FOR PC DREAMERS</h2>
            </div>
            <div className="read space-y-3 text-sm text-dim">
              <p>
                RH PC LAB is a small PC-building game made by and for the community. Every part is fictional, every price is game money, and every
                rig gets a fair score from the same open rules.
              </p>
              <p>
                It&apos;s an unofficial fan project inspired by{" "}
                <a href={COMPUTERS_RH_URL} target="_blank" rel="noopener noreferrer" className="text-mint underline-offset-4 hover:underline">
                  Computers RH
                </a>
                , and is not affiliated with or endorsed by Computers RH or Robinhood. No wallets, no tokens — just pixels and parts.
              </p>
            </div>
          </div>
        </RetroWindow>
      </section>
    </div>
  );
}
