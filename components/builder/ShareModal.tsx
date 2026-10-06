"use client";

import { useState } from "react";
import { PixelModal } from "@/components/ui/PixelModal";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { useToast } from "@/components/ui/PixelToast";
import { xShareUrl } from "@/lib/site";

interface Props {
  open: boolean;
  onClose: () => void;
  cardUrl: string;
  shareUrl: string;
  score: number;
  fileName: string;
  saved: boolean;
}

export function ShareModal({ open, onClose, cardUrl, shareUrl, score, fileName, saved }: Props) {
  const toast = useToast();
  const [loaded, setLoaded] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ tone: "success", title: "LINK COPIED" });
    } catch {
      toast({ tone: "error", title: "COPY FAILED", message: shareUrl });
    }
  }

  return (
    <PixelModal open={open} onClose={onClose} title="SHARE_CARD.PNG" className="max-w-2xl" footerLeft={saved ? "Public build page" : "Shareable rig link · not saved"}>
      <div className="flex flex-col gap-4">
        <div className="relative aspect-[1200/630] border border-line bg-navy-950">
          {!loaded ? <div className="absolute inset-0 grid place-items-center text-sm text-dim">RENDERING CARD<span className="animate-blink">_</span></div> : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cardUrl} alt="Share card for this rig" className="relative h-full w-full" onLoad={() => setLoaded(true)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <a href={cardUrl} download={fileName} className="px-btn px-btn-sm">
            <PixelIcon name="download" size={12} /> DOWNLOAD CARD
          </a>
          <a href={xShareUrl(score, shareUrl)} target="_blank" rel="noopener noreferrer" className="px-btn px-btn-mint px-btn-sm">
            SHARE ON 𝕏
          </a>
          <button type="button" onClick={copy} className="px-btn px-btn-ghost px-btn-sm">
            <PixelIcon name="copy" size={12} /> COPY LINK
          </button>
        </div>
        {!saved ? <p className="text-xs text-faint">Tip: save the build to get a permanent public page with likes.</p> : null}
      </div>
    </PixelModal>
  );
}
