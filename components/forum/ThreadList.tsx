import Link from "next/link";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { timeAgo } from "@/lib/utils";
import type { ThreadView } from "@/types/forum";
import { CategoryBadge } from "./CategoryBadge";

export function ThreadList({ threads, compact }: { threads: ThreadView[]; compact?: boolean }) {
  return (
    <ul className="divide-y divide-dashed divide-line border border-line">
      {threads.map((t) => (
        <li key={t.id}>
          <Link href={`/forum/${t.id}`} className="group flex items-start gap-3 px-3 py-3 hover:bg-navy-700/50">
            <PixelAvatar id={t.author.avatar} size={compact ? 28 : 34} className="mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={t.category} />
                {t.xUrl ? <span className="font-label text-[0.58rem] tracking-widest text-dim">𝕏 POST</span> : null}
                {t.buildId ? <span className="font-label text-[0.58rem] tracking-widest text-lilac">◆ RIG</span> : null}
              </div>
              <div className="mt-1 truncate font-bold tracking-wide group-hover:text-mint">{t.title}</div>
              {!compact ? <p className="read mt-0.5 line-clamp-1 text-xs text-dim">{t.body}</p> : null}
              <div className="mt-1 text-xs text-faint">
                @{t.author.username} · {timeAgo(t.lastActivityAt)}
              </div>
            </div>
            <div className="flex flex-none flex-col items-end text-xs text-dim">
              <span className="flex items-center gap-1 text-base font-bold text-ink">
                <PixelIcon name="sparkle" size={10} className="text-lilac" /> {t.replyCount}
              </span>
              <span className="font-label text-[0.55rem] tracking-widest">REPLIES</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
