"use client";

import { RetroWindow } from "@/components/ui/RetroWindow";
import { ErrorPanel } from "@/components/ui/States";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl pt-6">
      <RetroWindow title="CRASH.LOG" footerLeft={error.digest ? `digest ${error.digest}` : "unexpected error"}>
        <ErrorPanel code="500" title="SYSTEM CRASH" message="Something short-circuited in the lab. Try rebooting this page.">
          <button type="button" onClick={reset} className="px-btn px-btn-mint">[ REBOOT ]</button>
        </ErrorPanel>
      </RetroWindow>
    </div>
  );
}
