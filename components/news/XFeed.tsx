"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { LoadingScreen, Notice } from "@/components/ui/States";
import { cn } from "@/lib/utils";
import type { XFeedResponse } from "@/lib/x-feed/types";
import { XGlyph, XPostCard } from "./XPostCard";

const POLL_MS = 45_000;

/** Live feed of the project's X posts. Polls the server; new posts slide in on top. */
export function XFeed({ limit = 6, compact, className }: { limit?: number; compact?: boolean; className?: string }) {
  const [feed, setFeed] = useState<XFeedResponse | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [failed, setFailed] = useState(false);
  const known = useRef<Set<string> | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/x-feed?limit=${limit}`, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as XFeedResponse;
        if (!alive) return;
        if (known.current) {
          const added = data.posts.filter((p) => !known.current!.has(p.id)).map((p) => p.id);
          if (added.length) setFresh(new Set(added));
        }
        known.current = new Set(data.posts.map((p) => p.id));
        setFeed(data);
        setFailed(false);
      } catch {
        if (alive) setFailed(true);
      }
    };
    void load();
    const id = setInterval(() => document.visibilityState === "visible" && load(), POLL_MS);
    const onVis = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [limit]);

  if (!feed) return failed ? <Notice tone="error" title="FEED OFFLINE">Couldn&apos;t reach the news feed. Retrying shortly.</Notice> : <LoadingScreen label="TUNING IN..." className="!py-10" />;

  const profile = `https://x.com/${feed.username}`;

  if (feed.mode === "embed") {
    return (
      <div className={className}>
        <div className="overflow-hidden border border-line bg-navy-950 [color-scheme:dark]">
          <a className="twitter-timeline block p-4 text-sm text-dim" data-theme="dark" data-chrome="noheader nofooter transparent noborders" data-height={compact ? "520" : "720"} data-dnt="true" href={profile}>
            Loading posts by @{feed.username}…
          </a>
        </div>
        <Script src="https://platform.twitter.com/widgets.js" strategy="lazyOnload" />
        <a href={profile} target="_blank" rel="noopener noreferrer" className="px-btn px-btn-sm mt-3 w-full">
          <XGlyph className="h-3.5 w-3.5" /> OPEN @{feed.username.toUpperCase()} ON X
        </a>
      </div>
    );
  }

  const posts = feed.posts.slice(0, limit);
  return (
    <div className={cn("flex flex-col gap-3", className)} aria-live="polite">
      <div className="flex items-center justify-between text-xs text-dim">
        <span className="flex items-center gap-1.5">
          <span className={cn("inline-block h-2 w-2", feed.stale ? "bg-gold" : "animate-blink bg-mint")} />
          {feed.stale ? "RECONNECTING TO X" : "LIVE · AUTO-UPDATING"}
        </span>
        <a href={profile} target="_blank" rel="noopener noreferrer" className="hover:text-mint">@{feed.username} ↗</a>
      </div>
      {posts.length ? (
        posts.map((p) => <XPostCard key={p.id} post={p} fresh={fresh.has(p.id)} compact={compact} />)
      ) : (
        <div className="px-dashed px-4 py-8 text-center text-sm text-dim">NO POSTS YET. Waiting for the first transmission…</div>
      )}
    </div>
  );
}
