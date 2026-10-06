import { COMPONENTS } from "@/data/components";
import { CATEGORIES, type BuildParts, type Category, type GameComponent, type Selection } from "@/types/game";

const BY_ID = new Map<string, GameComponent>(COMPONENTS.map((c) => [c.id, c]));

export function getComponent(id: string | null | undefined): GameComponent | undefined {
  return id ? BY_ID.get(id) : undefined;
}

export function componentsFor<C extends Category>(category: C): Extract<GameComponent, { category: C }>[] {
  return COMPONENTS.filter((c): c is Extract<GameComponent, { category: C }> => c.category === category);
}

/** Resolve ids to components, dropping unknown ids or category mismatches. */
export function resolveSelection(selection: Selection): BuildParts {
  const parts: BuildParts = {};
  for (const cat of CATEGORIES) {
    const c = getComponent(selection[cat]);
    if (c && c.category === cat) (parts as Record<Category, GameComponent>)[cat] = c;
  }
  return parts;
}

export function selectionFromIds(ids: string[]): Selection {
  const sel: Selection = {};
  for (const id of ids) {
    const c = getComponent(id);
    if (c) sel[c.category] = c.id;
  }
  return sel;
}

export function withPart(parts: BuildParts, component: GameComponent): BuildParts {
  return { ...parts, [component.category]: component };
}
