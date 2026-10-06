import { Fragment } from "react";

const TOKEN = /(https?:\/\/[^\s<]+[^\s<.,:;"')\]!?])|(@[A-Za-z0-9_]{1,15})|(#[\p{L}\p{N}_]+)/gu;

/** Renders user text with safe links for URLs, @handles and #hashtags (X style). */
export function Linkify({ text, xLinks = false }: { text: string; xLinks?: boolean }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out.push(text.slice(last, i));
    const [tok, url, handle, tag] = m;
    const href = url ? url : handle && xLinks ? `https://x.com/${handle.slice(1)}` : tag && xLinks ? `https://x.com/hashtag/${encodeURIComponent(tag.slice(1))}` : null;
    out.push(
      href ? (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer nofollow ugc" className="break-all text-mint underline-offset-4 hover:underline">
          {url ? url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 48) + (url.replace(/^https?:\/\/(www\.)?/, "").length > 48 ? "…" : "") : tok}
        </a>
      ) : (
        <Fragment key={i}>{tok}</Fragment>
      ),
    );
    last = i + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
