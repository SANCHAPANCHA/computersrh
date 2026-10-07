"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { PixelIcon } from "@/components/ui/PixelIcon";
import type { Viewer } from "@/types/db";

export function ProfileMenu({ viewer }: { viewer: Viewer }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const items = [
    { href: "/dashboard", label: "DASHBOARD", icon: "power" },
    { href: `/u/${viewer.username}`, label: "PROFILE", icon: "user" },
    { href: "/achievements", label: "ACHIEVEMENTS", icon: "trophy" },
    { href: "/settings", label: "SETTINGS", icon: "wrench" },
  ];
  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Your account menu"
        className="flex items-center gap-2.5 bg-navy-800/90 py-1.5 pl-1.5 pr-3 shadow-[3px_3px_0_#8f7cc6] hover:bg-navy-700"
      >
        <PixelAvatar id={viewer.avatar} size={28} />
        <span className="max-w-[10rem] truncate text-sm text-mint">@{viewer.username}</span>
        <span className="text-[0.6rem] text-dim">▾</span>
      </button>
      {open ? (
        <ul className="absolute right-0 top-full z-50 mt-2 min-w-[12rem] border border-line-strong bg-navy-900 p-1.5 shadow-[5px_5px_0_#120c3a]" role="menu">
          {items.map((i) => (
            <li key={i.href} role="none">
              <Link role="menuitem" href={i.href} onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm tracking-wider hover:bg-navy-700">
                <PixelIcon name={i.icon} size={12} className="text-lilac" /> {i.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
