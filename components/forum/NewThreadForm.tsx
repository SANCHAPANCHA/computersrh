"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PixelInput, PixelSelect, PixelTextarea } from "@/components/ui/PixelInput";
import { Notice } from "@/components/ui/States";
import { createThread } from "@/lib/db/forum-actions";
import { FORUM_CATEGORIES, FORUM_LABELS, type ForumCategory } from "@/types/forum";

interface Props {
  initial: { category: ForumCategory; title: string; body: string; xUrl: string; buildId: string };
  builds: { id: string; name: string; score: number }[];
}

export function NewThreadForm({ initial, builds }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const res = await createThread({
      category: String(fd.get("category")),
      title: String(fd.get("title") ?? ""),
      body: String(fd.get("body") ?? ""),
      xUrl: String(fd.get("xUrl") ?? ""),
      buildId: String(fd.get("buildId") ?? ""),
    });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    router.push(`/community/${res.id}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {error ? <Notice tone="error" title="POST FAILED">{error}</Notice> : null}
      <PixelSelect label="Category" name="category" defaultValue={initial.category}>
        {FORUM_CATEGORIES.map((c) => <option key={c} value={c}>{FORUM_LABELS[c]}</option>)}
      </PixelSelect>
      <PixelInput label="Title" name="title" defaultValue={initial.title} required minLength={3} maxLength={90} placeholder="What's on your mind?" />
      <PixelTextarea label="Message" name="body" defaultValue={initial.body} required maxLength={2000} rows={6} placeholder="Share news, ask for build advice, show off…" />
      <PixelInput label="X post link (optional)" name="xUrl" type="url" defaultValue={initial.xUrl} placeholder="https://x.com/ComputersRh/status/…" hint="Link a post to discuss it." />
      {builds.length ? (
        <PixelSelect label="Attach one of your rigs (optional)" name="buildId" defaultValue={initial.buildId}>
          <option value="">— none —</option>
          {builds.map((b) => <option key={b.id} value={b.id}>{b.name} · {b.score}/100</option>)}
        </PixelSelect>
      ) : null}
      <button type="submit" className="px-btn px-btn-mint self-start" disabled={busy}>{busy ? "POSTING..." : "[ POST TOPIC ]"}</button>
    </form>
  );
}
