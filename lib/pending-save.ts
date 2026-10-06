"use client";

import type { SaveBuildInput } from "@/lib/db/actions";

// A build waiting for the user to finish signing up (e.g. email verification).
const KEY = "rhpclab:pending-save";

export function storePendingSave(input: SaveBuildInput) {
  localStorage.setItem(KEY, JSON.stringify({ ...input, storedAt: Date.now() }));
}

export function readPendingSave(): SaveBuildInput | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as SaveBuildInput & { storedAt: number };
    // Expire after 7 days.
    if (Date.now() - v.storedAt > 7 * 86_400_000) return clearPendingSave(), null;
    return v;
  } catch {
    return null;
  }
}

export function clearPendingSave() {
  localStorage.removeItem(KEY);
}
