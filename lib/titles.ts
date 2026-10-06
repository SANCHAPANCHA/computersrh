export function builderTitle(best: number, builds: number): string {
  if (!builds) return "NEW RECRUIT";
  if (best >= 96) return "MYTHIC ARCHITECT";
  if (best >= 88) return "LEGENDARY ENGINEER";
  if (best >= 76) return "HARDWARE PRO";
  if (best >= 60) return "PC ENTHUSIAST";
  return "ROOKIE BUILDER";
}
