import { redirect } from "next/navigation";
import { getViewer } from "@/lib/db/queries";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getGameConfig } from "./config";
import { getPlayerState } from "./queries";

/** Server-page helper: signed-in player + live config + state, or redirect. */
export async function loadPlayer(path: string) {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(path)}`);
  const cfg = await getGameConfig();
  const state = await getPlayerState(viewer.id, cfg);
  return { viewer, cfg, state, gameOnline: Boolean(getAdminSupabase()) };
}
