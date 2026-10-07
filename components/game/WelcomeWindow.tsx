import { PixelButton } from "@/components/ui/PixelButton";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { Credits } from "./Bits";

/** First-run screen: same starting balance for every new player. */
export function WelcomeWindow({ credits }: { credits: number }) {
  return (
    <RetroWindow title="WELCOME.EXE" tag="RH" footerLeft="Same starting balance for every player" footerRight={<><span className="inline-block h-2 w-2 animate-blink bg-mint" /> NEW PLAYER</>}>
      <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div>
          <div className="kicker">✧ ACCOUNT CREATED</div>
          <h2 className="h-display mt-2 text-4xl sm:text-5xl">WELCOME TO RH PC LAB</h2>
          <p className="mt-3 max-w-lg text-dim">
            Every builder starts with the same budget. Spend it on parts, build your PC, then come back every day to earn credits, win parts and upgrade it into a monster.
          </p>
          <ol className="mt-4 grid gap-1.5 text-sm sm:grid-cols-2">
            {["Build your first PC", "Check in every day", "Spin the free roulette", "Upgrade with duplicates", "Battle other players", "Climb the leaderboard"].map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center border border-line-strong text-[0.65rem] text-lilac">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
        <div className="px-panel px-panel-gold flex flex-col items-center gap-3 border px-6 py-5 text-center">
          <div className="px-stat-label !text-gold">STARTING BALANCE</div>
          <Credits value={credits} className="text-4xl font-bold" />
          <div className="text-xs text-dim">CREDITS</div>
          <PixelButton href="/builder?mode=rig" variant="mint" size="lg" className="mt-1">
            <PixelIcon name="wrench" size={14} /> BUILD YOUR FIRST PC
          </PixelButton>
        </div>
      </div>
    </RetroWindow>
  );
}
