import { parseRgb } from "@/lib/pc-engine/encode";
import { isRarity } from "@/lib/pc-engine/rarity";
import type { BuildView } from "@/types/db";
import type { Category, Selection } from "@/types/game";

export const BUILD_SELECT =
  "id, build_number, user_id, name, score, rarity, value, power, rgb, chaos_mode, build_time_seconds, likes_count, is_public, created_at, owner:profiles!builds_user_id_fkey(id, username, avatar), build_components(component_id, category)";

export interface BuildRow {
  id: string;
  build_number: number;
  user_id: string;
  name: string;
  score: number;
  rarity: string;
  value: number;
  power: number;
  rgb: string;
  chaos_mode: boolean;
  build_time_seconds: number | null;
  likes_count: number;
  is_public: boolean;
  created_at: string;
  owner: { id: string; username: string; avatar: string } | { id: string; username: string; avatar: string }[] | null;
  build_components: { component_id: string; category: string }[] | null;
}

export function toBuildView(row: BuildRow): BuildView {
  const owner = Array.isArray(row.owner) ? row.owner[0] : row.owner;
  const selection: Selection = {};
  for (const bc of row.build_components ?? []) selection[bc.category as Category] = bc.component_id;
  return {
    id: row.id,
    number: row.build_number,
    name: row.name,
    score: row.score,
    rarity: isRarity(row.rarity) ? row.rarity : "COMMON",
    value: row.value,
    power: row.power,
    rgb: parseRgb(row.rgb),
    chaos: row.chaos_mode,
    buildTimeSeconds: row.build_time_seconds,
    likes: row.likes_count,
    isPublic: row.is_public,
    createdAt: row.created_at,
    owner: owner ?? { id: row.user_id, username: "unknown", avatar: "bot" },
    selection,
  };
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
