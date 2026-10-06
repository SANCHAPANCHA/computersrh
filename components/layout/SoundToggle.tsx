"use client";

import { useSyncExternalStore } from "react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { isSoundOn, onSoundChange, setSoundOn } from "@/lib/sound";

export function SoundToggle({ inline }: { inline?: boolean }) {
  const on = useSyncExternalStore(
    (cb) => {
      const off = onSoundChange(cb);
      return () => void off();
    },
    isSoundOn,
    () => false,
  );
  return (
    <button
      type="button"
      onClick={() => setSoundOn(!on)}
      className={
        inline
          ? "flex w-full items-center gap-2 px-3 py-2 text-sm tracking-widest text-dim hover:text-ink"
          : "hidden h-9 items-center gap-2 bg-navy-800/90 px-2.5 text-xs tracking-widest text-dim shadow-[3px_3px_0_#8f7cc6] hover:text-ink sm:flex"
      }
      aria-pressed={on}
      aria-label={on ? "Mute sound effects" : "Unmute sound effects"}
    >
      <PixelIcon name={on ? "sound" : "mute"} size={14} className={on ? "text-mint" : ""} />
      SFX {on ? "ON" : "OFF"}
    </button>
  );
}
