import type { Rarity, RgbColor, Selection } from "./game";

export interface Viewer {
  id: string;
  username: string;
  avatar: string;
  credits: number | null;
}

export interface PublicProfile {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  favoriteComponent: string | null;
  createdAt: string;
}

export interface BuildView {
  id: string;
  number: number;
  name: string;
  score: number;
  rarity: Rarity;
  value: number;
  power: number;
  rgb: RgbColor;
  chaos: boolean;
  buildTimeSeconds: number | null;
  likes: number;
  isPublic: boolean;
  createdAt: string;
  owner: { id: string; username: string; avatar: string };
  selection: Selection;
}

export interface LeaderRow {
  id: string;
  username: string;
  avatar: string;
  buildsCount: number;
  bestScore: number;
  totalLikes: number;
}

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };
