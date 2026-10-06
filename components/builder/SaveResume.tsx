"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PixelButton } from "@/components/ui/PixelButton";
import { ErrorPanel, LoadingScreen } from "@/components/ui/States";
import { useToast } from "@/components/ui/PixelToast";
import { saveBuild } from "@/lib/db/actions";
import { clearPendingSave, readPendingSave } from "@/lib/pending-save";

/** Finishes a save that was interrupted by email verification or login. */
export function SaveResume() {
  const router = useRouter();
  const toast = useToast();
  const started = useRef(false);
  const [status, setStatus] = useState<"saving" | "empty" | { error: string }>("saving");

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const run = async () => {
      const pending = readPendingSave();
      if (!pending) return setStatus("empty");
      const res = await saveBuild(pending);
      if (!res.ok) return setStatus({ error: res.error });
      clearPendingSave();
      localStorage.removeItem("rhpclab:draft");
      toast({ tone: "success", title: "BUILD SAVED", message: "Welcome to the lab!" });
      res.unlocked.forEach((a, i) => setTimeout(() => toast({ tone: "achievement", title: `UNLOCKED: ${a}` }), 500 + i * 600));
      router.replace(`/build/${res.id}?new=1`);
      router.refresh();
    };
    void run();
  }, [router, toast]);

  if (status === "saving") return <LoadingScreen label="SAVING YOUR RIG..." />;
  if (status === "empty")
    return (
      <ErrorPanel title="NOTHING TO SAVE" message="There's no pending build in this browser. Your account is ready though!" action={{ href: "/builder", label: "BUILD YOUR PC" }} />
    );
  return (
    <ErrorPanel title="SAVE FAILED" message={status.error}>
      <PixelButton href="/login?next=/save" variant="mint">[ LOG IN ]</PixelButton>
    </ErrorPanel>
  );
}
