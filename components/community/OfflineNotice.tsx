import { Notice } from "@/components/ui/States";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function OfflineNotice() {
  if (isSupabaseConfigured()) return null;
  return (
    <Notice tone="warn" title="COMMUNITY OFFLINE">
      This lab isn&apos;t connected to Supabase yet, so community builds, likes and leaderboards are empty. The builder works fully offline.
    </Notice>
  );
}
