"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShareModal } from "@/components/builder/ShareModal";
import { useViewer } from "@/components/layout/Providers";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { useToast } from "@/components/ui/PixelToast";
import { deleteBuild, toggleLike, updateBuild } from "@/lib/db/actions";
import { play } from "@/lib/sound";
import { cn } from "@/lib/utils";

interface Props {
  buildId?: string;
  likes?: number;
  liked?: boolean;
  score: number;
  shareUrl: string;
  cardUrl: string;
  similarHref: string;
  saved: boolean;
}

export function BuildActions({ buildId, likes = 0, liked = false, score, shareUrl, cardUrl, similarHref, saved }: Props) {
  const router = useRouter();
  const toast = useToast();
  const { viewer } = useViewer();
  const [state, setState] = useState({ liked, likes });
  const [burst, setBurst] = useState(0);
  const [busy, setBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  async function like() {
    if (!buildId) return;
    if (!viewer) {
      toast({ tone: "info", title: "LOG IN TO LIKE", message: "Create a free account to like builds." });
      router.push(`/login?next=${encodeURIComponent(`/build/${buildId}`)}`);
      return;
    }
    setBusy(true);
    const optimistic = { liked: !state.liked, likes: state.likes + (state.liked ? -1 : 1) };
    setState(optimistic);
    if (optimistic.liked) { setBurst((b) => b + 1); play("like"); }
    const res = await toggleLike(buildId);
    setBusy(false);
    if (res.ok) setState({ liked: res.liked, likes: res.likes });
    else { setState(state); toast({ tone: "error", title: "LIKE FAILED", message: res.error }); }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ tone: "success", title: "LINK COPIED" });
    } catch {
      toast({ tone: "error", title: "COPY FAILED", message: shareUrl });
    }
  }

  return (
    <>
      {buildId ? (
        <button type="button" onClick={like} disabled={busy} aria-pressed={state.liked} className={cn("px-btn px-btn-sm", state.liked ? "px-btn-danger" : "px-btn-ghost")}>
          <span key={burst} style={burst ? { animation: "heart-burst 0.45s steps(5, end)" } : undefined} className="inline-flex">
            <PixelIcon name="heart" size={12} />
          </span>
          {state.liked ? "LIKED" : "LIKE"} · {state.likes}
        </button>
      ) : null}
      <button type="button" onClick={() => setShareOpen(true)} className="px-btn px-btn-mint px-btn-sm">
        <PixelIcon name="star" size={12} /> SHARE
      </button>
      <button type="button" onClick={copy} className="px-btn px-btn-ghost px-btn-sm">
        <PixelIcon name="copy" size={12} /> COPY LINK
      </button>
      <a href={similarHref} className="px-btn px-btn-sm">
        <PixelIcon name="wrench" size={12} /> BUILD SOMETHING SIMILAR
      </a>
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} cardUrl={cardUrl} shareUrl={shareUrl} score={score} fileName={`rh-pc-lab-${score}.png`} saved={saved} />
    </>
  );
}

export function OwnerControls({ buildId, name, isPublic }: { buildId: string; name: string; isPublic: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [draft, setDraft] = useState(name);
  const [pub, setPub] = useState(isPublic);
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>, okMsg: string) {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (res.ok) { toast({ tone: "success", title: okMsg }); router.refresh(); }
    else toast({ tone: "error", title: "SAVE FAILED", message: res.error });
    return res.ok;
  }

  return (
    <div className="px-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="owner-name" className="px-label !text-sm">Rename rig</label>
        <input id="owner-name" className="px-input" value={draft} maxLength={32} onChange={(e) => setDraft(e.target.value)} />
      </div>
      <button type="button" className="px-btn px-btn-sm" disabled={busy || draft === name} onClick={() => run(() => updateBuild(buildId, { name: draft }), "RIG RENAMED")}>SAVE NAME</button>
      <button type="button" className="px-btn px-btn-ghost px-btn-sm" disabled={busy} onClick={async () => { if (await run(() => updateBuild(buildId, { isPublic: !pub }), pub ? "NOW PRIVATE" : "NOW PUBLIC")) setPub(!pub); }}>
        {pub ? "MAKE PRIVATE" : "MAKE PUBLIC"}
      </button>
      <button type="button" className="px-btn px-btn-danger px-btn-sm" disabled={busy} onClick={async () => { if (confirm("Delete this rig forever?") && (await run(() => deleteBuild(buildId), "RIG DELETED"))) router.push("/dashboard"); }}>
        DELETE
      </button>
    </div>
  );
}
