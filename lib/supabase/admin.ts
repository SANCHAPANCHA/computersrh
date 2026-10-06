import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

let admin: SupabaseClient | null | undefined;

/**
 * Service-role client for trusted server jobs (X feed sync). Never import this
 * from client components: the key bypasses RLS.
 */
export function getAdminSupabase(): SupabaseClient | null {
  if (admin !== undefined) return admin;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  admin = SUPABASE_URL && key ? createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  return admin;
}
