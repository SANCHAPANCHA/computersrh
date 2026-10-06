import Link from "next/link";
import { COMPUTERS_RH_URL, COMPUTERS_RH_X, DISCLAIMER, NOT_AFFILIATED } from "@/lib/site";

const linkCls = "underline-offset-4 hover:text-navy-900 hover:underline";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-20 px-3 pb-16 sm:px-5 sm:pb-6">
      <div className="pixel-clip mx-auto max-w-6xl bg-chrome-100/95 px-5 py-5 text-chrome-ink shadow-[inset_-4px_-4px_0_#e2c3bb,inset_3px_3px_0_#fff]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-bold tracking-wide text-navy-900">RH PC LAB</div>
            <p className="mt-1 text-sm">{DISCLAIMER}</p>
            <p className="text-xs opacity-80">{NOT_AFFILIATED}</p>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <li><a className={linkCls} href={COMPUTERS_RH_URL} target="_blank" rel="noopener noreferrer">Computers RH ↗</a></li>
            <li><a className={linkCls} href={COMPUTERS_RH_X} target="_blank" rel="noopener noreferrer">X ↗</a></li>
            <li><Link className={linkCls} href="/privacy">Privacy</Link></li>
            <li><Link className={linkCls} href="/terms">Terms</Link></li>
          </ul>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-chrome-400 pt-3 text-xs opacity-80">
          <span>Off-chain community web app · fictional parts &amp; prices</span>
          <span className="hidden sm:inline">v1.0 ◆ made with pixels</span>
        </div>
      </div>
    </footer>
  );
}
