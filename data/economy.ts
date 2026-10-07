// Default game-economy tuning. Values here are seeded into the `game_config`
// table; edit the table in Supabase to retune live without a redeploy.
import type { Category, Rarity } from "../types/game";

export interface RouletteSlot {
  /** Relative weight (higher = more likely). */
  weight: number;
  reward: { type: "credits"; amount: number } | { type: "component"; rarity: Rarity };
}

export interface LevelGrowth {
  /** Multiplier on the per-level performance bonus curve. */
  perf: number;
  /** Extra power draw per level above 1, as a fraction (0.04 = +4%). */
  power?: number;
  /** PSU: extra wattage per level. Cooling: extra TDP rating per level. */
  capacity?: number;
  /** Case: extra airflow points per level. */
  airflow?: number;
}

export interface GameConfig {
  startingCredits: number;
  /** Check-in rewards by streak day; the cycle restarts after the last day. */
  checkinRewards: number[];
  roulette: RouletteSlot[];
  shop: {
    /** Rarities that can only be won, never bought. */
    unbuyable: Rarity[];
    /** Shop price = catalog price × this. */
    priceMultiplier: number;
  };
  upgrades: {
    maxLevel: number;
    /** Performance bonus at each level (index 0 = level 1). */
    perfBonus: number[];
    growth: Record<Category, LevelGrowth>;
  };
  battle: {
    /** Score window for matchmaking, widened step by step until a rival is found. */
    windows: number[];
    rewardedPerDay: number;
    cooldownSeconds: number;
    winCredits: number;
    lossCredits: number;
    winPoints: number;
    lossPoints: number;
    /** Bonus credits when a win streak hits these lengths. */
    streakBonus: Record<string, number>;
    /** ±fraction of random swing applied to each stat roll. */
    variance: number;
    weights: Record<"compute" | "graphics" | "memory" | "thermals" | "power" | "balance", number>;
  };
  challengeReward: number;
  pcLevels: { level: number; name: string; minScore: number }[];
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  startingCredits: 5000,
  checkinRewards: [250, 300, 350, 400, 500, 600, 1000],
  roulette: [
    { weight: 22, reward: { type: "credits", amount: 150 } },
    { weight: 12, reward: { type: "credits", amount: 400 } },
    { weight: 3, reward: { type: "credits", amount: 1500 } },
    { weight: 26, reward: { type: "component", rarity: "COMMON" } },
    { weight: 18, reward: { type: "component", rarity: "UNCOMMON" } },
    { weight: 11, reward: { type: "component", rarity: "RARE" } },
    { weight: 5.5, reward: { type: "component", rarity: "EPIC" } },
    { weight: 2, reward: { type: "component", rarity: "LEGENDARY" } },
    { weight: 0.5, reward: { type: "component", rarity: "MYTHIC" } },
  ],
  shop: { unbuyable: ["MYTHIC"], priceMultiplier: 1 },
  upgrades: {
    maxLevel: 5,
    perfBonus: [0, 6, 11, 15, 18],
    growth: {
      cpu: { perf: 1, power: 0.04 },
      gpu: { perf: 1, power: 0.04 },
      ram: { perf: 0.9 },
      storage: { perf: 0.9 },
      motherboard: { perf: 0.7 },
      cooling: { perf: 0.9, capacity: 0.06 },
      psu: { perf: 0.8, capacity: 0.05 },
      case: { perf: 0.6, airflow: 3 },
      monitor: { perf: 0.6 },
      keyboard: { perf: 0.5 },
      mouse: { perf: 0.5 },
    },
  },
  battle: {
    windows: [8, 15, 25, 100],
    rewardedPerDay: 10,
    cooldownSeconds: 10,
    winCredits: 150,
    lossCredits: 30,
    winPoints: 25,
    lossPoints: 5,
    streakBonus: { "3": 200, "5": 500, "10": 1500 },
    variance: 0.08,
    weights: { compute: 0.22, graphics: 0.28, memory: 0.14, thermals: 0.12, power: 0.12, balance: 0.12 },
  },
  challengeReward: 200,
  pcLevels: [
    { level: 1, name: "STARTER", minScore: 0 },
    { level: 2, name: "GAMING", minScore: 45 },
    { level: 3, name: "ADVANCED", minScore: 62 },
    { level: 4, name: "BEAST", minScore: 76 },
    { level: 5, name: "LEGENDARY", minScore: 88 },
  ],
};

/** Opponents used when no real player is in range (early game / quiet hours). */
export const LAB_BOTS: { id: string; name: string; avatar: string; selection: Partial<Record<Category, string>>; levels?: number }[] = [
  { id: "bot-retro", name: "LAB BOT · RETRO", avatar: "bot", selection: { case: "case-retrobox", cpu: "cpu-retrochip-486", gpu: "gpu-pixelforce-1650", motherboard: "mobo-retroboard-4l", ram: "ram-basic-8", storage: "ssd-spindisk-1tb", psu: "psu-powerunit-450", cooling: "cool-stockfan", monitor: "mon-retrotube-17", keyboard: "kb-typewriter", mouse: "mouse-basicclick" } },
  { id: "bot-office", name: "LAB BOT · OFFICE", avatar: "floppy", selection: { case: "case-nightbox", cpu: "cpu-rh-core-i3", gpu: "gpu-pixelforce-3060", motherboard: "mobo-pixelboard-b", ram: "ram-cloud-16", storage: "ssd-bytedrive-1tb", psu: "psu-powerunit-650", cooling: "cool-turbocooler", monitor: "mon-office-22", keyboard: "kb-membrane", mouse: "mouse-glide" } },
  { id: "bot-budget", name: "LAB BOT · BUDGET", avatar: "frog", selection: { case: "case-nightbox", cpu: "cpu-novachip-5600", gpu: "gpu-pixelforce-3060", motherboard: "mobo-novaboard-mini", ram: "ram-cloud-32", storage: "ssd-bytedrive-2tb", psu: "psu-powerunit-650", cooling: "cool-turbocooler", monitor: "mon-gamer-24", keyboard: "kb-clackboard", mouse: "mouse-glide" } },
  { id: "bot-pocket", name: "LAB BOT · POCKET", avatar: "cat", selection: { case: "case-pocketbox", cpu: "cpu-novachip-7950x", gpu: "gpu-pixelforce-7800", motherboard: "mobo-novaboard-mini", ram: "ram-cloud-64", storage: "ssd-bytedrive-4tb", psu: "psu-powerunit-850", cooling: "cool-iceloop-240", monitor: "mon-pixelview-27", keyboard: "kb-pixelkeys-60", mouse: "mouse-featherlite" } },
  { id: "bot-flagship", name: "LAB BOT · FLAGSHIP", avatar: "knight", selection: { case: "case-titan", cpu: "cpu-rh-core-x9", gpu: "gpu-pixelforce-9090", motherboard: "mobo-omniboard", ram: "ram-quantum-128", storage: "ssd-warpdrive-8tb", psu: "psu-powerunit-1200", cooling: "cool-iceloop-360", monitor: "mon-horizon-49", keyboard: "kb-aurora", mouse: "mouse-zenith" } },
  { id: "bot-omega", name: "LAB BOT · OMEGA", avatar: "alien", levels: 3, selection: { case: "case-prism", cpu: "cpu-quantum-q1", gpu: "gpu-neon-titan", motherboard: "mobo-novaboard-pro", ram: "ram-hyper-256", storage: "ssd-infinity-vault", psu: "psu-reactorcore-1600", cooling: "cool-cryocore", monitor: "mon-horizon-49", keyboard: "kb-aurora", mouse: "mouse-zenith" } },
];
