// Core RH PC LAB game types. Runtime constants live here so both the UI and
// the seed generator (plain Node) can share them.

export const CATEGORIES = [
  "case",
  "cpu",
  "gpu",
  "motherboard",
  "ram",
  "storage",
  "psu",
  "cooling",
  "monitor",
  "keyboard",
  "mouse",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  case: "CASE",
  cpu: "CPU",
  gpu: "GPU",
  motherboard: "MOTHERBOARD",
  ram: "RAM",
  storage: "STORAGE",
  psu: "PSU",
  cooling: "COOLING",
  monitor: "MONITOR",
  keyboard: "KEYBOARD",
  mouse: "MOUSE",
};

export const RARITIES = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"] as const;
export type Rarity = (typeof RARITIES)[number];

export type Socket = "RH-1" | "NV-5" | "LEGACY-4";
export type FormFactor = "ITX" | "MATX" | "ATX" | "EATX";
export type RamType = "DDR4" | "DDR5";
export type CaseSize = "MINI" | "MID" | "FULL";
export type PsuEfficiency = "BRONZE" | "GOLD" | "PLATINUM" | "TITANIUM";

export interface CaseMeta {
  size: CaseSize;
  formFactors: FormFactor[];
  maxGpuLength: number;
  maxCoolerHeight: number;
  maxRadiator: number;
  airflow: number;
  color: string;
  trim: string;
  glass: boolean;
  retro?: boolean;
}
export interface CpuMeta {
  socket: Socket;
  cores: number;
  boostGhz: number;
}
export interface GpuMeta {
  length: number;
  vram: number;
  fans: number;
}
export interface MotherboardMeta {
  socket: Socket;
  formFactor: FormFactor;
  ramType: RamType;
  maxRamGb: number;
  m2Slots: number;
}
export interface RamMeta {
  ramType: RamType;
  capacityGb: number;
  speed: number;
  sticks: number;
}
export interface StorageMeta {
  interface: "NVME" | "SATA";
  capacityTb: number;
  readMbs: number;
}
export interface PsuMeta {
  wattage: number;
  efficiency: PsuEfficiency;
  modular: boolean;
}
export interface CoolingMeta {
  type: "AIR" | "AIO" | "CUSTOM";
  sockets: Socket[];
  maxTdp: number;
  height?: number;
  radiator?: number;
}
export interface MonitorMeta {
  sizeIn: number;
  resolution: string;
  refreshHz: number;
  ultrawide?: boolean;
  crt?: boolean;
}
export interface KeyboardMeta {
  layout: "60%" | "TKL" | "FULL";
  switches: string;
  rgb: boolean;
  retro?: boolean;
}
export interface MouseMeta {
  dpi: number;
  weightG: number;
  wireless: boolean;
  rgb: boolean;
}

interface Base {
  id: string;
  name: string;
  rarity: Rarity;
  /** Fictional in-game price (LAB credits shown as $). */
  price: number;
  /** 0–100 quality stat. */
  performance: number;
  /** Watts drawn from the PSU (CPU value doubles as TDP). */
  power: number;
  description: string;
}

export type MetaMap = {
  case: CaseMeta;
  cpu: CpuMeta;
  gpu: GpuMeta;
  motherboard: MotherboardMeta;
  ram: RamMeta;
  storage: StorageMeta;
  psu: PsuMeta;
  cooling: CoolingMeta;
  monitor: MonitorMeta;
  keyboard: KeyboardMeta;
  mouse: MouseMeta;
};

export type ComponentOf<C extends Category> = Base & { category: C; metadata: MetaMap[C] };
export type GameComponent = { [C in Category]: ComponentOf<C> }[Category];

/** Selected component ids by category. */
export type Selection = Partial<Record<Category, string>>;
/** Resolved components by category. */
export type BuildParts = { [C in Category]?: ComponentOf<C> };

export const RGB_COLORS = {
  mint: "#3CE6B0",
  pink: "#FF7EB6",
  violet: "#A98BFF",
  gold: "#FFD166",
  ice: "#7FD8FF",
  red: "#FF5A6E",
  off: "#2A3358",
} as const;
export type RgbColor = keyof typeof RGB_COLORS;
