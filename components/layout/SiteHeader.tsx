import Link from "next/link";
import { buttonClass } from "@/components/ui/PixelButton";
import { PixelIcon } from "@/components/ui/PixelIcon";
import type { Viewer } from "@/types/db";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";
import { ProfileMenu } from "./ProfileMenu";
import { SoundToggle } from "./SoundToggle";

export function SiteHeader({ viewer, authEnabled }: { viewer: Viewer | null; authEnabled: boolean }) {
  return (
    <header className="relative z-40 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="relative mx-auto flex max-w-6xl items-center gap-4">
        <Logo />
        <nav aria-label="Main" className="ml-auto hidden items-center lg:flex">
          {/* clip-path lives on a background layer so it can't clip the dropdowns */}
          <div className="relative px-2">
            <span aria-hidden className="pixel-clip absolute inset-0 bg-chrome-100 shadow-[inset_-3px_-3px_0_#e2c3bb,inset_2px_2px_0_#fff]" />
            <NavLinks className="relative flex items-center" />
          </div>
        </nav>
        <div className="ml-auto flex items-center gap-3 lg:ml-2">
          <SoundToggle />
          {viewer && viewer.credits !== null ? (
            <Link href="/daily" className="flex h-9 items-center gap-1.5 bg-navy-800/90 px-2.5 text-sm tabular-nums text-gold shadow-[3px_3px_0_#8f7cc6] hover:bg-navy-700" aria-label={`${viewer.credits} credits. Earn more on the daily page.`} title="Credits">
              <PixelIcon name="coin" size={14} />
              {viewer.credits.toLocaleString("en-US")}
            </Link>
          ) : null}
          {viewer ? (
            <ProfileMenu viewer={viewer} />
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
