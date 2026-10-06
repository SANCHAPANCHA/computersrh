import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  tag?: ReactNode;
  actions?: ReactNode;
  footerLeft?: ReactNode;
  footerRight?: ReactNode;
  footer?: boolean;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
  id?: string;
}

/** The signature retro OS window: peach chrome, traffic squares, navy body. */
export function RetroWindow({ title, tag = "LAB", actions, footerLeft, footerRight, footer = true, className, bodyClassName, children, id }: Props) {
  return (
    <section id={id} className={cn("rh-window", className)}>
      <div className={cn("rh-window-frame pixel-clip", !footer && "pb-3")}>
        <div className="rh-window-bar">
          <span className="rh-dot bg-[#f25c7a]" aria-hidden />
          <span className="rh-dot bg-[#f5a63a]" aria-hidden />
          <span className="rh-dot bg-[#34d38f]" aria-hidden />
          <h2 className="rh-window-title">{title}</h2>
          <div className="ml-auto flex items-center gap-3">
            {actions}
            {tag ? <span className="rh-window-tag">{tag}</span> : null}
          </div>
        </div>
        <div className={cn("rh-window-body pixel-clip crt", bodyClassName ?? "p-5 sm:p-7")}>{children}</div>
        {footer ? (
          <div className="rh-window-foot">
            <span className="truncate">{footerLeft ?? "rhpclab · community lab"}</span>
            {footerRight ? <span className="flex items-center gap-1.5 truncate">{footerRight}</span> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
