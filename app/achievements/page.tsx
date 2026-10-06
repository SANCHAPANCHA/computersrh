import type { Metadata } from "next";
import { AchievementGrid } from "@/components/community/AchievementGrid";
import { PixelButton } from "@/components/ui/PixelButton";
import { RetroWindow } from "@/components/ui/RetroWindow";
import { ACHIEVEMENTS } from "@/data/achievements";
import { getUnlockedAchievements, getViewer } from "@/lib/db/queries";

export const metadata: Metadata = { title: "Achievements" };

export default async function AchievementsPage() {
  const viewer = await getViewer();
  const unlocked = viewer ? await getUnlockedAchievements(viewer.id) : {};
  const count = Object.keys(unlocked).length;
  return (
    <div className="page-enter mx-auto max-w-6xl">
      <RetroWindow title="ACHIEVEMENTS.EXE" footerLeft={viewer ? `${count}/${ACHIEVEMENTS.length} unlocked` : "Log in to track progress"}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="kicker">✧ TROPHY CASE</div>
            <h1 className="h-display mt-2 text-4xl sm:text-5xl">ACHIEVEMENTS</h1>
          </div>
          {!viewer ? <PixelButton href="/login?next=/achievements" size="sm">[ LOG IN ]</PixelButton> : null}
        </div>
        <AchievementGrid unlocked={unlocked} />
      </RetroWindow>
    </div>
  );
}
