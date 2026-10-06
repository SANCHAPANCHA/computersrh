import Link from "next/link";
import { Linkify } from "@/components/ui/Linkify";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { timeAgo, cn } from "@/lib/utils";
import { xPostUrl, type XPost } from "@/lib/x-feed/types";

export function XGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.2l-4.8-6.3L6.4 22H3.3l7.3-8.3L1 2h6.3l4.4 5.8zm-1.1 18h1.7L6.3 3.9H4.5z" />
    </svg>
  );
}

export function XPostCard({ post, fresh, compact, discuss = true }: { post: XPost; fresh?: boolean; compact?: boolean; discuss?: boolean }) {
  const url = xPostUrl(post.username, post.id);
  const photos = post.media.slice(0, 4);
  return (
    <article className={cn("px-card p-3.5", fresh && "!border-mint animate-rise shadow-[0_0_0_1px_var(--color-mint)]")} aria-label={`Post by @${post.username}`}>
      <header className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 flex-none place-items-center bg-cream text-navy-900 shadow-[2px_2px_0_#8f7cc6]">
          <XGlyph className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-sm font-bold">Computers RH</div>
          <div className="truncate text-xs text-dim">
            @{post.username} · <time dateTime={post.postedAt}>{timeAgo(post.postedAt)}</time>
          </div>
        </div>
        {fresh ? <span className="bg-mint px-1.5 py-0.5 font-label text-[0.55rem] tracking-widest text-navy-900">NEW</span> : null}
      </header>
      <p className={cn("read mt-2.5 whitespace-pre-line break-words text-sm text-ink/95", compact && "line-clamp-6")}>
        <Linkify text={post.text} xLinks />
      </p>
      {photos.length ? (
        <div className={cn("mt-3 grid gap-1 border border-line bg-navy-950", photos.length > 1 && "grid-cols-2")}>
          {photos.map((m, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="relative block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.alt || "Image from the post"} loading="lazy" className={cn("w-full object-cover", photos.length > 1 ? "aspect-square" : "max-h-80")} />
              {m.type !== "photo" ? <span className="absolute bottom-1.5 left-1.5 bg-navy-900/90 px-1.5 py-0.5 font-label text-[0.55rem] tracking-widest">▶ VIDEO</span> : null}
            </a>
          ))}
        </div>
      ) : null}
      <footer className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-dim">
        {post.metrics.likes != null ? <span className="flex items-center gap-1"><PixelIcon name="heart" size={10} className="text-pink" />{post.metrics.likes}</span> : null}
        {post.metrics.reposts != null ? <span>⟲ {post.metrics.reposts}</span> : null}
        <span className="ml-auto flex gap-2">
          {discuss ? (
            <Link href={`/community/new?x=${encodeURIComponent(url)}`} className="px-btn px-btn-ghost px-btn-sm !text-[0.68rem]">
              DISCUSS
            </Link>
          ) : null}
          <a href={url} target="_blank" rel="noopener noreferrer" className="px-btn px-btn-sm !text-[0.68rem]">
            VIEW ON <XGlyph className="h-3 w-3" />
          </a>
        </span>
      </footer>
    </article>
  );
}
