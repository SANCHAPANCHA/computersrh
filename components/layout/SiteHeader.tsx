import Link from "next/link";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { buttonClass } from "@/components/ui/PixelButton";
import type { Viewer } from "@/types/db";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";
import { SoundToggle } from "./SoundToggle";

export function SiteHeader({ viewer, authEnabled }: { viewer: Viewer | null; authEnabled: boolean }) {
  return (
    <header className="relative z-40 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="relative mx-auto flex max-w-6xl items-center gap-4">
        <Logo />
        <nav aria-label="Main" className="ml-auto hidden items-center lg:flex">
          <div className="pixel-clip bg-chrome-100 px-2 shadow-[inset_-3px_-3px_0_#e2c3bb,inset_2px_2px_0_#fff]">
            <NavLinks className="flex items-center" />
          </div>
        </nav>
        <div className="ml-auto flex items-center gap-3 lg:ml-2">
          <SoundToggle />
          {viewer ? (
            <Link href="/dashboard" className="hidden items-center gap-2.5 bg-navy-800/90 py-1.5 pl-1.5 pr-3 shadow-[3px_3px_0_#8f7cc6] hover:bg-navy-700 sm:flex" aria-label="Your dashboard">
              <PixelAvatar id={viewer.avatar} size={28} />
              <span className="max-w-[10rem] truncate text-sm text-mint">@{viewer.username}</span>
            </Link>
          ) : authEnabled ? (
            <Link href="/login" className={buttonClass("cream", "sm", "hidden sm:inline-flex")}>
              [ LOG IN ]
            </Link>
          ) : null}
          <MobileMenu viewer={viewer} authEnabled={authEnabled} />
        </div>
      </div>
    </header>
  );
}
