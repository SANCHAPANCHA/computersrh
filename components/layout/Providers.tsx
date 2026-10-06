"use client";

import { createContext, useContext, type ReactNode } from "react";
import { ToastProvider } from "@/components/ui/PixelToast";
import type { Viewer } from "@/types/db";

const ViewerCtx = createContext<{ viewer: Viewer | null; authEnabled: boolean }>({ viewer: null, authEnabled: false });

export function useViewer() {
  return useContext(ViewerCtx);
}

export function Providers({ viewer, authEnabled, children }: { viewer: Viewer | null; authEnabled: boolean; children: ReactNode }) {
  return (
    <ViewerCtx.Provider value={{ viewer, authEnabled }}>
      <ToastProvider>{children}</ToastProvider>
    </ViewerCtx.Provider>
  );
}
