import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PixelCard({ href, className, children, hover }: { href?: string; className?: string; children: ReactNode; hover?: boolean }) {
  const cls = cn("px-card block", (hover || href) && "px-card-hover", className);
  return href ? (
    <Link href={href} className={cls}>
      {children}
    </Link>
  ) : (
    <div className={cls}>{children}</div>
  );
}

export function StatBox({ label, value, accent, sub, className }: { label: string; value: ReactNode; accent?: "mint" | "gold" | "pink"; sub?: ReactNode; className?: string }) {
  const color = accent === "mint" ? "text-mint" : accent === "gold" ? "text-gold" : accent === "pink" ? "text-pink" : "text-ink";
  return (
    <div className={cn("px-panel px-3.5 py-3", accent === "mint" && "px-panel-accent", className)}>
      <div className="px-stat-label">{label}</div>
      <div className={cn("mt-1 text-2xl font-bold leading-none sm:text-[1.7rem]", color)}>{value}</div>
      {sub ? <div className="mt-1 text-xs text-faint">{sub}</div> : null}
    </div>
  );
}

export function SectionHeading({ kicker, title, children, className }: { kicker?: string; title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-5 flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        {kicker ? <div className="kicker mb-2">✧ {kicker}</div> : null}
        <h2 className="h-display text-3xl sm:text-4xl">{title}</h2>
      </div>
      {children}
    </div>
  );
}
