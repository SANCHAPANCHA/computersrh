"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { RetroWindow } from "./RetroWindow";
import { PixelIcon } from "./PixelIcon";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  footerLeft?: ReactNode;
}

export function PixelModal({ open, onClose, title, children, className, footerLeft }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => ref.current?.querySelector<HTMLElement>("input, button:not([data-close])")?.focus(), 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(t);
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-[#080a24]/75 p-3 backdrop-blur-[1px] sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className={cn("page-enter my-auto w-full max-w-lg", className)}>
        <RetroWindow
          title={title}
          footerLeft={footerLeft}
          actions={
            <button data-close type="button" onClick={onClose} className="grid h-7 w-7 place-items-center text-chrome-ink hover:text-red" aria-label="Close dialog">
              <PixelIcon name="close" size={14} />
            </button>
          }
          tag={null}
        >
          {children}
        </RetroWindow>
      </div>
    </div>,
    document.body,
  );
}
