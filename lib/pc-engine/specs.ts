import type { GameComponent } from "@/types/game";

/** Short spec chips for a component, e.g. ["RH-1", "24 CORES"]. */
export function partSpecs(c: GameComponent): string[] {
  switch (c.category) {
    case "case": return [c.metadata.size, c.metadata.formFactors.join("/"), `GPU ≤${c.metadata.maxGpuLength}MM`, c.metadata.maxRadiator ? `RAD ${c.metadata.maxRadiator}` : "NO RAD"];
    case "cpu": return [c.metadata.socket, `${c.metadata.cores} CORES`, `${c.metadata.boostGhz.toFixed(1)}GHZ`];
    case "gpu": return [`${c.metadata.length}MM`, `${c.metadata.vram}GB`, `${c.metadata.fans} FAN${c.metadata.fans > 1 ? "S" : ""}`];
    case "motherboard": return [c.metadata.socket, c.metadata.formFactor, c.metadata.ramType, `≤${c.metadata.maxRamGb}GB`, `${c.metadata.m2Slots}× M.2`];
    case "ram": return [c.metadata.ramType, `${c.metadata.capacityGb}GB`, `${c.metadata.speed}MT/S`];
    case "storage": return [c.metadata.interface, `${c.metadata.capacityTb}TB`, `${c.metadata.readMbs.toLocaleString("en-US")}MB/S`];
    case "psu": return [`${c.metadata.wattage}W`, `80+ ${c.metadata.efficiency}`, c.metadata.modular ? "MODULAR" : "FIXED"];
    case "cooling": return [c.metadata.type, `≤${c.metadata.maxTdp}W`, c.metadata.height ? `${c.metadata.height}MM` : `${c.metadata.radiator}MM RAD`, c.metadata.sockets.join("/")];
    case "monitor": return [`${c.metadata.sizeIn}"`, c.metadata.resolution, `${c.metadata.refreshHz}HZ`];
    case "keyboard": return [c.metadata.layout, c.metadata.switches.toUpperCase(), c.metadata.rgb ? "RGB" : "NO RGB"];
    case "mouse": return [`${(c.metadata.dpi / 1000).toFixed(0)}K DPI`, `${c.metadata.weightG}G`, c.metadata.wireless ? "WIRELESS" : "WIRED"];
  }
}
