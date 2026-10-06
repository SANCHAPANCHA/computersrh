import Link from "next/link";
import { cn } from "@/lib/utils";

export interface TabLink {
  href: string;
  label: string;
  active?: boolean;
}

/** Route-driven tabs (server friendly). */
export function PixelTabs({ tabs, className, label }: { tabs: TabLink[]; className?: string; label: string }) {
  return (
    <nav aria-label={label} className={cn("-mx-1 flex gap-2 overflow-x-auto px-1 pb-1", className)}>
      {tabs.map((t) => (
        <Link key={t.href} href={t.href} className="px-tab" aria-current={t.active ? "page" : undefined} scroll={false}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
