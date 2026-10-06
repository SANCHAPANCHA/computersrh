"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";

/** Re-renders the page when community rows change (Supabase Realtime). */
export function LiveRefresh({ table, filter }: { table: "forum_threads" | "forum_replies"; filter?: string }) {
  const router = useRouter();
  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const channel = sb
      .channel(`live:${table}:${filter ?? "all"}`)
      .on("postgres_changes", { event: "*", schema: "public", table, ...(filter ? { filter } : {}) }, () => {
        clearTimeout(t);
        t = setTimeout(() => router.refresh(), 250);
      })
      .subscribe();
    return () => {
      clearTimeout(t);
      void sb.removeChannel(channel);
    };
  }, [router, table, filter]);
  return null;
}
