import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PixelButton } from "./PixelButton";
import { PixelIcon } from "./PixelIcon";
import { AsciiBar } from "./PixelProgressBar";

export function EmptyState({ title, message, action, className }: { title: string; message: string; action?: { href: string; label: string }; className?: string }) {
  return (
    <div className={cn("px-dashed flex flex-col items-center justify-center gap-3 px-6 py-12 text-center", className)}>
      <PixelIcon name="sparkle" size={22} className="text-lilac" />
      <div className="text-lg font-bold tracking-wide">{title}</div>
      <p className="text-sm text-dim">{message}</p>
      {action ? (
        <PixelButton href={action.href} variant="mint" size="sm" className="mt-2">
          [ {action.label} ]
        </PixelButton>
      ) : null}
    </div>
  );
}

export function LoadingScreen({ label = "LOADING COMPONENTS...", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-16 text-center", className)} role="status" aria-live="polite">
      <div className="text-lg tracking-widest">
        {label}
        <span className="animate-blink">_</span>
      </div>
      <div className="text-xl">
        <AsciiBar value={72} />
      </div>
    </div>
  );
}

export function ErrorPanel({ code, title, message, action, children }: { code?: string; title: string; message: string; action?: { href: string; label: string }; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      {code ? <div className="font-label text-xs tracking-[0.3em] text-red">ERR · {code}</div> : null}
      <div className="flex items-center gap-3 text-red">
        <PixelIcon name="warn" size={28} />
        <h1 className="h-display text-4xl text-ink sm:text-5xl">{title}</h1>
      </div>
      <p className="max-w-md text-dim">{message}</p>
      {children}
      {action ? (
        <PixelButton href={action.href} size="lg" className="mt-2">
          [ {action.label} ]
        </PixelButton>
      ) : null}
    </div>
  );
}

export function Notice({ tone = "info", title, children }: { tone?: "info" | "warn" | "error" | "success"; title: string; children?: ReactNode }) {
  const color = { info: "border-lilac text-lilac", warn: "border-gold text-gold", error: "border-red text-red", success: "border-mint text-mint" }[tone];
  const icon = { info: "sparkle", warn: "warn", error: "warn", success: "check" }[tone];
  return (
    <div className={cn("flex gap-3 border bg-navy-950/60 px-4 py-3", color)} role={tone === "error" ? "alert" : "status"}>
      <PixelIcon name={icon} size={16} className="mt-0.5" />
      <div>
        <div className="text-sm font-bold tracking-wide">{title}</div>
        {children ? <div className="mt-1 text-sm text-dim">{children}</div> : null}
      </div>
    </div>
  );
}
