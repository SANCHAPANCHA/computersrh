"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/PixelToast";
import { deleteReply, deleteThread } from "@/lib/db/forum-actions";

export function DeleteButton({ kind, id, threadId }: { kind: "thread" | "reply"; id: string; threadId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  async function run() {
    if (!confirm(kind === "thread" ? "Delete this topic and all replies?" : "Delete this message?")) return;
    setBusy(true);
    const res = kind === "thread" ? await deleteThread(id) : await deleteReply(id, threadId);
    setBusy(false);
    if (!res.ok) return toast({ tone: "error", title: "DELETE FAILED", message: res.error });
    if (kind === "thread") router.push("/community");
    router.refresh();
  }
  return (
    <button type="button" onClick={run} disabled={busy} className="text-xs text-faint underline-offset-4 hover:text-red hover:underline">
      delete
    </button>
  );
}
