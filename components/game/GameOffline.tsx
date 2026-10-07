import { Notice } from "@/components/ui/States";

export function GameOffline({ online }: { online: boolean }) {
  if (online) return null;
  return (
    <Notice tone="warn" title="GAME SERVER OFFLINE">
      Credits, purchases, upgrades and battles need <code>SUPABASE_SERVICE_ROLE_KEY</code> on the server. Add it to your environment and redeploy.
    </Notice>
  );
}
