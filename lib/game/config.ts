import { cache } from "react";
import { DEFAULT_GAME_CONFIG, type GameConfig } from "@/data/economy";
import { createSupabaseServer } from "@/lib/supabase/server";

function merge<T>(base: T, over: unknown): T {
  if (!over || typeof over !== "object" || Array.isArray(over) || !base || typeof base !== "object" || Array.isArray(base)) {
    return (over ?? base) as T;
  }
  const out = { ...base } as Record<string, unknown>;
  for (const [k, v] of Object.entries(over)) out[k] = k in out ? merge(out[k], v) : v;
  return out as T;
}

/** Live economy tuning: the `game_config` row merged over code defaults. */
export const getGameConfig = cache(async (): Promise<GameConfig> => {
  const sb = await createSupabaseServer();
  if (!sb) return DEFAULT_GAME_CONFIG;
  const { data } = await sb.from("game_config").select("value").eq("key", "economy").maybeSingle();
  return merge(DEFAULT_GAME_CONFIG, data?.value);
});
