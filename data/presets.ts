import type { RgbColor, Selection } from "../types/game";

export interface PresetRig {
  key: string;
  name: string;
  tagline: string;
  rgb: RgbColor;
  selection: Selection;
}

/** Lab starter rigs: shown when the community is empty and used as templates. */
export const PRESETS: PresetRig[] = [
  {
    key: "flagship",
    name: "MIDNIGHT FLAGSHIP",
    tagline: "Top-shelf parts, zero compromises.",
    rgb: "violet",
    selection: {
      case: "case-titan", cpu: "cpu-rh-core-x9", gpu: "gpu-pixelforce-9090", motherboard: "mobo-omniboard",
      ram: "ram-quantum-128", storage: "ssd-warpdrive-8tb", psu: "psu-powerunit-1200", cooling: "cool-iceloop-360",
      monitor: "mon-horizon-49", keyboard: "kb-aurora", mouse: "mouse-zenith",
    },
  },
  {
    key: "budget",
    name: "BUDGET HERO",
    tagline: "Big frames for small wallets.",
    rgb: "mint",
    selection: {
      case: "case-nightbox", cpu: "cpu-novachip-5600", gpu: "gpu-pixelforce-3060", motherboard: "mobo-novaboard-mini",
      ram: "ram-cloud-32", storage: "ssd-bytedrive-2tb", psu: "psu-powerunit-650", cooling: "cool-turbocooler",
      monitor: "mon-gamer-24", keyboard: "kb-clackboard", mouse: "mouse-glide",
    },
  },
  {
    key: "pocket",
    name: "POCKET ROCKET",
    tagline: "ITX cube with a serious punch.",
    rgb: "pink",
    selection: {
      case: "case-pocketbox", cpu: "cpu-novachip-7950x", gpu: "gpu-pixelforce-7800", motherboard: "mobo-novaboard-mini",
      ram: "ram-cloud-64", storage: "ssd-bytedrive-4tb", psu: "psu-powerunit-850", cooling: "cool-iceloop-240",
      monitor: "mon-pixelview-27", keyboard: "kb-pixelkeys-60", mouse: "mouse-featherlite",
    },
  },
  {
    key: "retro",
    name: "RETRO DREAM",
    tagline: "Beige box. CRT glow. Pure nostalgia.",
    rgb: "gold",
    selection: {
      case: "case-retrobox", cpu: "cpu-retrochip-486", gpu: "gpu-pixelforce-1650", motherboard: "mobo-retroboard-4l",
      ram: "ram-basic-8", storage: "ssd-spindisk-1tb", psu: "psu-powerunit-450", cooling: "cool-stockfan",
      monitor: "mon-retrotube-17", keyboard: "kb-typewriter", mouse: "mouse-basicclick",
    },
  },
];
