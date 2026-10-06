"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/builder", label: "BUILD" },
  { href: "/explore", label: "EXPLORE" },
  { href: "/leaderboard", label: "LEADERBOARD" },
  { href: "/challenges", label: "CHALLENGES" },
];

export function NavLinks({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <ul className={className}>
      {NAV.map((n) => {
        const active = path === n.href || path.startsWith(`${n.href}/`);
        return (
          <li key={n.href}>
            <Link
              href={n.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative block px-3 py-2 text-[0.95rem] tracking-[0.08em] text-chrome-ink transition-colors hover:text-navy-900",
                active && "text-navy-900 after:absolute after:inset-x-3 after:-bottom-0.5 after:h-[3px] after:bg-mint",
              )}
            >
              {n.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
