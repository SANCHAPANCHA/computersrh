import { CATEGORIES, RGB_COLORS, type RgbColor, type Selection } from "@/types/game";
import { selectionFromIds } from "./catalog";

/** Compact, URL-safe representation of a build: comma-separated component ids. */
export function encodeSelection(sel: Selection): string {
  return CATEGORIES.map((c) => sel[c]).filter(Boolean).join(",");
}

export function decodeSelection(raw: string | null | undefined): Selection {
  if (!raw) return {};
  return selectionFromIds(raw.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20));
}

export function parseRgb(v: string | null | undefined): RgbColor {
  return v && v in RGB_COLORS ? (v as RgbColor) : "mint";
}
