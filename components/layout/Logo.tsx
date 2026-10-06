import Link from "next/link";
import { cn } from "@/lib/utils";

/** Original RH PC LAB wordmark: chunky cream letters + mint LAB chip. */
export function Logo({ className, size = "md" }: { className?: string; size?: "md" | "lg" }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="RH PC LAB home">
      <span
        className={cn(
          "relative grid place-items-center bg-cream font-bold text-navy-900 shadow-[3px_3px_0_#8f7cc6,inset_-2px_-2px_0_#e2c3bb]",
          size === "lg" ? "h-12 w-12 text-2xl" : "h-9 w-9 text-lg",
        )}
      >
        RH
        <span className="absolute -right-1 -top-1 h-2 w-2 bg-mint group-hover:animate-blink" />
      </span>
      <span className={cn("flex items-baseline gap-1.5 font-bold tracking-wide text-cream text-shadow-pixel", size === "lg" ? "text-3xl" : "text-xl")}>
        PC
        <span className={cn("bg-mint px-1.5 text-navy-900 [text-shadow:none]", size === "lg" ? "py-0.5" : "py-px")}>LAB</span>
      </span>
    </Link>
  );
}
