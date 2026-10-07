"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { cn } from "@/lib/utils";

interface Item {
  href: string;
  label: string;
  icon: string;
  hint?: string;
}
interface Group {
  label: string;
  items: Item[];
}

export const NAV_GROUPS: Group[] = [
  {
    label: "PLAY",
    items: [
      { href: "/pc", label: "MY PC", icon: "monitor", hint: "Your rig & level" },
      { href: "/builder", label: "BUILDER", icon: "wrench", hint: "Free sandbox builder" },
      { href: "/shop", label: "SHOP", icon: "cart", hint: "Spend credits" },
      { href: "/inventory", label: "INVENTORY", icon: "floppy", hint: "Parts & upgrades" },
      { href: "/daily", label: "DAILY", icon: "gift", hint: "Check-in & roulette" },
      { href: "/battles", label: "BATTLES", icon: "swords", hint: "PC vs PC" },
      { href: "/challenges", label: "CHALLENGES", icon: "trophy", hint: "Daily build challenge" },
    ],
  },
  {
    label: "COMMUNITY",
    items: [
      { href: "/explore", label: "EXPLORE", icon: "star", hint: "Community builds" },
      { href: "/forum", label: "FORUM", icon: "sparkle", hint: "Topics & live chat" },
      { href: "/leaderboard", label: "LEADERBOARD", icon: "crown", hint: "Top builders" },
    ],
  },
];
export const NAV_NEWS: Item = { href: "/news", label: "X NEWS", icon: "sparkle" };

const isActive = (path: string, href: string) => path === href || path.startsWith(`${href}/`);
const linkCls = "relative block px-3 py-2 text-[0.95rem] tracking-[0.08em] text-chrome-ink transition-colors hover:text-navy-900";

function Dropdown({ group, path }: { group: Group; path: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const active = group.items.some((i) => isActive(path, i.href));

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <li ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className={cn(linkCls, "flex items-center gap-1.5", active && "text-navy-900 after:absolute after:inset-x-3 after:-bottom-0.5 after:h-[3px] after:bg-mint")}
      >
        {group.label} <span className="text-[0.6rem]">▾</span>
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-50 pt-2">
          <ul className="min-w-[15rem] border border-line-strong bg-navy-900 p-1.5 shadow-[5px_5px_0_#120c3a]" role="menu">
            {group.items.map((i) => (
              <li key={i.href} role="none">
                <Link
                  role="menuitem"
                  href={i.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(path, i.href) ? "page" : undefined}
                  className={cn("flex items-center gap-3 px-3 py-2 hover:bg-navy-700", isActive(path, i.href) && "bg-mint/10 text-mint")}
                >
                  <PixelIcon name={i.icon} size={14} className="text-lilac" />
                  <span className="flex-1">
                    <span className="block text-sm tracking-wider">{i.label}</span>
                    {i.hint ? <span className="block text-[0.7rem] text-faint">{i.hint}</span> : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

/** Desktop navigation: grouped dropdowns on the peach chrome bar. */
export function NavLinks({ className }: { className?: string }) {
  const path = usePathname();
  return (
    <ul className={className}>
      {NAV_GROUPS.map((g) => (
        <Dropdown key={g.label} group={g} path={path} />
      ))}
      <li>
        <Link href={NAV_NEWS.href} aria-current={isActive(path, NAV_NEWS.href) ? "page" : undefined} className={cn(linkCls, isActive(path, NAV_NEWS.href) && "text-navy-900 after:absolute after:inset-x-3 after:-bottom-0.5 after:h-[3px] after:bg-mint")}>
          {NAV_NEWS.label}
        </Link>
      </li>
    </ul>
  );
}

/** Mobile navigation: grouped lists inside the MENU.EXE window. */
export function MobileNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const groups: Group[] = [...NAV_GROUPS, { label: "NEWS", items: [NAV_NEWS] }];
  return (
    <div className="flex flex-col gap-3">
      {groups.map((g) => (
        <div key={g.label}>
          <div className="kicker mb-1 px-1 !text-[0.65rem]">{g.label}</div>
          <ul className="grid grid-cols-2 gap-1">
            {g.items.map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  onClick={onNavigate}
                  aria-current={isActive(path, i.href) ? "page" : undefined}
                  className={cn("flex items-center gap-2 border px-2.5 py-2.5 text-sm tracking-wider", isActive(path, i.href) ? "border-mint bg-mint/10 text-mint" : "border-line text-ink hover:border-line-strong")}
                >
                  <PixelIcon name={i.icon} size={12} className="text-lilac" />
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
