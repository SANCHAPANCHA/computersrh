import type { ReactNode } from "react";
import { RetroWindow } from "@/components/ui/RetroWindow";

export function AuthShell({ title, heading, sub, children }: { title: string; heading: string; sub?: string; children: ReactNode }) {
  return (
    <div className="page-enter mx-auto w-full max-w-md">
      <RetroWindow title={title} footerLeft="Email only · no wallet needed" footerRight="🔒 secure">
        <h1 className="h-display text-4xl">{heading}</h1>
        {sub ? <p className="mt-2 text-sm text-dim">{sub}</p> : null}
        <div className="mt-6">{children}</div>
      </RetroWindow>
    </div>
  );
}
