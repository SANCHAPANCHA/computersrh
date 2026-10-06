import type { Metadata } from "next";
import { SaveResume } from "@/components/builder/SaveResume";
import { RetroWindow } from "@/components/ui/RetroWindow";

export const metadata: Metadata = { title: "Saving build", robots: { index: false } };

export default function SavePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <RetroWindow title="SAVE.EXE">
        <SaveResume />
      </RetroWindow>
    </div>
  );
}
