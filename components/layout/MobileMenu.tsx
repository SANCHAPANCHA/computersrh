"use client";

import Link from "next/link";
import { useState } from "react";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { PixelIcon } from "@/components/ui/PixelIcon";
import type { Viewer } from "@/types/db";
import { MobileNavLinks } from "./NavLinks";
import { SoundToggle } from "./SoundToggle";

export function MobileMenu({ viewer, authEnabled }: { viewer: Viewer | null; authEnabled: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="grid h-10 w-10 place-items-center bg-navy-800 text-cream shadow-[3px_3px_0_#8f7cc6]"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <PixelIcon name={open ? "close" : "menu"} size={18} />
      </button>
      {open ? (
        <div id="mobile-nav" className="absolute inset-x-0 top-full z-50 mt-3 animate-rise">
          <div className="rh-window">
            <div className="rh-window-frame pixel-clip pb-3">
              <div className="rh-window-bar !min-h-0 !py-2">
                <span className="rh-dot !h-3 !w-3 bg-[#f25c7a]" />
                <span className="rh-dot !h-3 !w-3 bg-[#f5a63a]" />
                <span className="rh-dot !h-3 !w-3 bg-[#34d38f]" />
                <span className="rh-window-title !text-sm">MENU.EXE</span>
              </div>
              <div className="rh-window-body pixel-clip p-3">
                <MobileNavLinks onNavigate={close} />
                <div className="px-divider my-3" />
                {viewer ? (
                  <div className="flex flex-col gap-1">
                    <Link href="/dashboard" onClick={close} className="flex items-center gap-3 px-3 py-2">
                      <PixelAvatar id={viewer.avatar} size={28} />
                      <span className="text-mint">@{viewer.username}</span>
                    </Link>
                    <Link href={`/u/${viewer.username}`} onClick={close} className="px-3 py-2 text-dim">PROFILE</Link>
                    <Link href="/achievements" onClick={close} className="px-3 py-2 text-dim">ACHIEVEMENTS</Link>
                    <Link href="/settings" onClick={close} className="px-3 py-2 text-dim">SETTINGS</Link>
                  </div>
                ) : authEnabled ? (
                  <Link href="/login" onClick={close} className="px-btn px-btn-sm w-full">
                    [ LOG IN ]
                  </Link>
                ) : null}
                <div className="px-divider my-3" />
                <SoundToggle inline />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
