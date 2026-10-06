"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useToast } from "@/components/ui/PixelToast";
import { postReply } from "@/lib/db/forum-actions";
import { play } from "@/lib/sound";

export function ReplyForm({ threadId }: { threadId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e?: FormEvent) {
    e?.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    const res = await postReply(threadId, text);
    setBusy(false);
    if (!res.ok) return toast({ tone: "error", title: "MESSAGE NOT SENT", message: res.error });
    play("click");
    setText("");
    router.refresh();
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void send();
  };

  return (
    <form onSubmit={send} className="flex flex-col gap-2">
      <label htmlFor="reply" className="sr-only">Your message</label>
      <textarea id="reply" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKey} maxLength={2000} rows={3} placeholder="Say something nice to the lab…" className="px-input resize-y" />
      <div className="flex items-center justify-between gap-3 text-xs text-faint">
        <span>{text.length}/2000 · Ctrl+Enter to send</span>
        <button type="submit" className="px-btn px-btn-mint px-btn-sm" disabled={busy || !text.trim()}>
          {busy ? "SENDING..." : "SEND ▶"}
        </button>
      </div>
    </form>
  );
}
