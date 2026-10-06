"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PixelIcon } from "./PixelIcon";

type Tone = "success" | "error" | "info" | "achievement";
interface Toast {
  id: number;
  title: string;
  message?: string;
  tone: Tone;
}

const Ctx = createContext<(t: Omit<Toast, "id">) => void>(() => {});

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((cur) => [...cur.slice(-3), { ...t, id }]);
    setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== id)), t.tone === "achievement" ? 5200 : 3600);
  }, []);
  const value = useMemo(() => push, [push]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[120] flex w-[min(92vw,360px)] -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-4 sm:translate-x-0" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto animate-rise" role="status">
            <div className="rh-window">
              <div className="rh-window-frame pixel-clip !px-2 pb-2" style={{ ["--px" as string]: "5px" }}>
                <div className="flex items-center gap-2 px-1 py-1.5 text-xs text-chrome-ink">
                  <span className="rh-dot !h-2.5 !w-2.5 bg-[#f25c7a]" />
                  <span className="rh-dot !h-2.5 !w-2.5 bg-[#f5a63a]" />
                  <span className="rh-dot !h-2.5 !w-2.5 bg-[#34d38f]" />
                  <span className="ml-1 font-label tracking-widest">{t.tone === "achievement" ? "ACHIEVEMENT" : "SYSTEM"}</span>
                </div>
                <div className="rh-window-body pixel-clip flex items-start gap-3 px-3 py-2.5">
                  <PixelIcon
                    name={t.tone === "error" ? "warn" : t.tone === "achievement" ? "trophy" : t.tone === "success" ? "check" : "sparkle"}
                    size={18}
                    className={cn("mt-0.5", { success: "text-mint", error: "text-red", info: "text-lilac", achievement: "text-gold animate-pop" }[t.tone])}
                  />
                  <div>
                    <div className="text-sm font-bold tracking-wide">{t.title}</div>
                    {t.message ? <div className="mt-0.5 text-xs text-dim">{t.message}</div> : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
