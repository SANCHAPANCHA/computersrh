import type { BuildParts, Category, GameComponent } from "@/types/game";
import { withPart } from "./catalog";
import { powerDraw } from "./power";

export type ConflictSeverity = "error" | "warning";

export interface Conflict {
  id: string;
  severity: ConflictSeverity;
  categories: Category[];
  message: string;
}

/** Every compatibility rule. Add new rules here; each sees the whole build. */
export function getConflicts(parts: BuildParts): Conflict[] {
  const out: Conflict[] = [];
  const { cpu, motherboard: mobo, ram, gpu, case: pcCase, cooling, psu, storage } = parts;

  if (cpu && mobo && cpu.metadata.socket !== mobo.metadata.socket) {
    out.push({
      id: "cpu-socket",
      severity: "error",
      categories: ["cpu", "motherboard"],
      message: `This motherboard does not support this CPU socket. ${mobo.name} is ${mobo.metadata.socket}, ${cpu.name} needs ${cpu.metadata.socket}.`,
    });
  }

  if (ram && mobo && ram.metadata.ramType !== mobo.metadata.ramType) {
    out.push({
      id: "ram-type",
      severity: "error",
      categories: ["ram", "motherboard"],
      message: `${mobo.name} only supports ${mobo.metadata.ramType} memory, but ${ram.name} is ${ram.metadata.ramType}.`,
    });
  }

  if (ram && mobo && ram.metadata.capacityGb > mobo.metadata.maxRamGb) {
    out.push({
      id: "ram-capacity",
      severity: "error",
      categories: ["ram", "motherboard"],
      message: `${ram.metadata.capacityGb}GB exceeds the ${mobo.metadata.maxRamGb}GB maximum of ${mobo.name}.`,
    });
  }

  if (mobo && pcCase && !pcCase.metadata.formFactors.includes(mobo.metadata.formFactor)) {
    out.push({
      id: "case-form-factor",
      severity: "error",
      categories: ["case", "motherboard"],
      message: `${pcCase.name} can't fit an ${mobo.metadata.formFactor} motherboard. It supports ${pcCase.metadata.formFactors.join(" / ")}.`,
    });
  }

  if (gpu && pcCase && gpu.metadata.length > pcCase.metadata.maxGpuLength) {
    out.push({
      id: "gpu-length",
      severity: "error",
      categories: ["gpu", "case"],
      message: `Your GPU requires a larger case. ${gpu.name} is ${gpu.metadata.length}mm, ${pcCase.name} fits up to ${pcCase.metadata.maxGpuLength}mm.`,
    });
  }

  if (cooling && cpu && !cooling.metadata.sockets.includes(cpu.metadata.socket)) {
    out.push({
      id: "cooler-socket",
      severity: "error",
      categories: ["cooling", "cpu"],
      message: `${cooling.name} has no mounting bracket for the ${cpu.metadata.socket} socket.`,
    });
  }

  if (cooling && pcCase) {
    const m = cooling.metadata;
    if (m.type === "AIR" && m.height && m.height > pcCase.metadata.maxCoolerHeight) {
      out.push({
        id: "cooler-height",
        severity: "error",
        categories: ["cooling", "case"],
        message: `${cooling.name} is ${m.height}mm tall. ${pcCase.name} only clears ${pcCase.metadata.maxCoolerHeight}mm.`,
      });
    }
    if (m.radiator && m.radiator > pcCase.metadata.maxRadiator) {
      out.push({
        id: "cooler-radiator",
        severity: "error",
        categories: ["cooling", "case"],
        message: pcCase.metadata.maxRadiator
          ? `${pcCase.name} only mounts radiators up to ${pcCase.metadata.maxRadiator}mm, ${cooling.name} needs ${m.radiator}mm.`
          : `${pcCase.name} has no radiator mounts for ${cooling.name}.`,
      });
    }
  }

  if (cooling && cpu && cooling.metadata.maxTdp < cpu.power) {
    out.push({
      id: "cooler-tdp",
      severity: "warning",
      categories: ["cooling", "cpu"],
      message: `${cooling.name} is rated for ${cooling.metadata.maxTdp}W but ${cpu.name} pulls ${cpu.power}W. Expect thermal throttling.`,
    });
  }

  if (storage && mobo && storage.metadata.interface === "NVME" && mobo.metadata.m2Slots === 0) {
    out.push({
      id: "storage-m2",
      severity: "error",
      categories: ["storage", "motherboard"],
      message: `${mobo.name} has no M.2 slot for an NVMe drive like ${storage.name}.`,
    });
  }

  if (psu) {
    const draw = powerDraw(parts);
    const cap = psu.metadata.wattage;
    if (draw > cap) {
      out.push({
        id: "psu-capacity",
        severity: "error",
        categories: ["psu"],
        message: `Your build draws ${draw}W but ${psu.name} only delivers ${cap}W. Pick a bigger PSU.`,
      });
    } else if (draw > cap * 0.9) {
      out.push({
        id: "psu-headroom",
        severity: "warning",
        categories: ["psu"],
        message: `Only ${cap - draw}W of headroom left on ${psu.name}. It'll run hot and loud.`,
      });
    }
  }

  return out;
}

/** Conflicts a candidate would cause if it replaced the current pick in its category. */
export function checkCandidate(parts: BuildParts, candidate: GameComponent): Conflict[] {
  const before = new Set(getConflicts(parts).map((c) => c.id));
  return getConflicts(withPart(parts, candidate)).filter(
    (c) =>
      c.categories.includes(candidate.category) ||
      // A hungry part can overload the already-chosen PSU.
      (c.categories[0] === "psu" && candidate.power > 0 && !before.has(c.id)),
  );
}

export const hasErrors = (conflicts: Conflict[]) => conflicts.some((c) => c.severity === "error");
