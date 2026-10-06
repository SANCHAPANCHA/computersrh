import type { ReactNode } from "react";
import { RetroWindow } from "./RetroWindow";

export function LegalPage({ file, title, updated, children }: { file: string; title: string; updated: string; children: ReactNode }) {
  return (
    <div className="page-enter mx-auto max-w-3xl">
      <RetroWindow title={file} footerLeft={`Last updated ${updated}`}>
        <h1 className="h-display text-4xl sm:text-5xl">{title}</h1>
        <div className="read mt-6 space-y-5 text-sm text-dim [&_h2]:mb-1 [&_h2]:font-pixel [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-[square] [&_strong]:text-ink">{children}</div>
      </RetroWindow>
    </div>
  );
}
