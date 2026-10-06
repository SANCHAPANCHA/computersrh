import { Countdown } from "@/components/ui/Countdown";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { describeRules } from "@/lib/pc-engine/challenges";
import type { DailyChallenge } from "@/types/content";
import type { ReactNode } from "react";

export function ChallengeCard({ challenge, children }: { challenge: DailyChallenge; children?: ReactNode }) {
  return (
    <div className="grid gap-5 md:grid-cols-[1fr_auto]">
      <div>
        <div className="kicker">✧ TODAY&apos;S CHALLENGE · {challenge.startDate}</div>
        <h3 className="h-display mt-2 text-3xl sm:text-4xl">{challenge.title}</h3>
        <p className="mt-2 text-dim">{challenge.description}</p>
        <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
          {describeRules(challenge.rules).map((r) => (
            <li key={r} className="flex items-center gap-2 text-sm">
              <PixelIcon name="check" size={12} className="text-mint" /> {r}
            </li>
          ))}
        </ul>
        {children}
      </div>
      <div className="px-panel-gold border px-4 py-3 md:self-start">
        <div className="mb-2 text-sm font-bold text-gold">Next challenge in</div>
        <Countdown />
      </div>
    </div>
  );
}
