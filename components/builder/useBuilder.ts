"use client";

import { useCallback, useEffect, useMemo, useReducer } from "react";
import { evaluateSelection } from "@/lib/pc-engine";
import { CATEGORIES, type Category, type GameComponent, type RgbColor, type Selection } from "@/types/game";

export type Phase = "build" | "boot" | "reveal";

export interface BuilderState {
  selection: Selection;
  step: number;
  chaos: boolean;
  rgb: RgbColor;
  name: string;
  startedAt: number | null;
  finishedAt: number | null;
  assisted: boolean;
  phase: Phase;
}

type Action =
  | { type: "select"; component: GameComponent }
  | { type: "clear"; category: Category }
  | { type: "step"; step: number }
  | { type: "chaos"; on: boolean }
  | { type: "rgb"; rgb: RgbColor }
  | { type: "name"; name: string }
  | { type: "phase"; phase: Phase }
  | { type: "finish" }
  | { type: "reset" }
  | { type: "load"; state: Partial<BuilderState> };

const DRAFT_KEY = "rhpclab:draft";

export const initialBuilder = (over: Partial<BuilderState> = {}): BuilderState => ({
  selection: {},
  step: 0,
  chaos: false,
  rgb: "mint",
  name: "MY FIRST RIG",
  startedAt: null,
  finishedAt: null,
  assisted: false,
  phase: "build",
  ...over,
});

function reducer(s: BuilderState, a: Action): BuilderState {
  switch (a.type) {
    case "select":
      return { ...s, selection: { ...s.selection, [a.component.category]: a.component.id }, startedAt: s.startedAt ?? Date.now() };
    case "clear": {
      const selection = { ...s.selection };
      delete selection[a.category];
      return { ...s, selection };
    }
    case "step":
      return { ...s, step: Math.max(0, Math.min(CATEGORIES.length - 1, a.step)) };
    case "chaos":
      return { ...s, chaos: a.on };
    case "rgb":
      return { ...s, rgb: a.rgb };
    case "name":
      return { ...s, name: a.name.slice(0, 32) };
    case "phase":
      return { ...s, phase: a.phase };
    case "finish":
      return { ...s, phase: "boot", finishedAt: Date.now() };
    case "reset":
      return initialBuilder({ chaos: s.chaos, rgb: s.rgb });
    case "load":
      return { ...s, ...a.state };
  }
}

export function useBuilder(initial: Partial<BuilderState>, fromUrl: boolean) {
  const [state, dispatch] = useReducer(reducer, initialBuilder(initial));

  // Restore an unfinished draft when not opened from a shared/preset link.
  useEffect(() => {
    if (fromUrl) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as Partial<BuilderState>;
        dispatch({ type: "load", state: { selection: d.selection ?? {}, step: d.step ?? 0, chaos: !!d.chaos, rgb: d.rgb ?? "mint", name: d.name ?? "MY FIRST RIG", startedAt: d.startedAt ?? null, assisted: !!d.assisted } });
      }
    } catch {
      /* ignore corrupt drafts */
    }
  }, [fromUrl]);

  useEffect(() => {
    if (state.phase !== "build") return;
    const { selection, step, chaos, rgb, name, startedAt, assisted } = state;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ selection, step, chaos, rgb, name, startedAt, assisted }));
  }, [state]);

  const summary = useMemo(() => evaluateSelection(state.selection), [state.selection]);
  const clearDraft = useCallback(() => localStorage.removeItem(DRAFT_KEY), []);
  const buildTimeSeconds = state.startedAt && state.finishedAt && !state.assisted ? Math.round((state.finishedAt - state.startedAt) / 1000) : null;

  return { state, dispatch, summary, clearDraft, buildTimeSeconds };
}
