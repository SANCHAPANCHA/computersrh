// Catalog v2 expansion: more fictional RH PC LAB parts. Not real products or
// official Computers RH items.
import type { GameComponent } from "../types/game";

export const EXPANSION_COMPONENTS: GameComponent[] = [
  // ───────── CASES ─────────
  {
    id: "case-bitcube", category: "case", name: "BitCube Micro", rarity: "COMMON", price: 45, performance: 35, power: 0,
    description: "Shoebox-sized ITX starter cube. Tight fit, small GPUs only.",
    metadata: { size: "MINI", formFactors: ["ITX"], maxGpuLength: 230, maxCoolerHeight: 60, maxRadiator: 0, airflow: 40, color: "#2E3A6E", trim: "#5A6390", glass: false },
  },
  {
    id: "case-meshrunner", category: "case", name: "MeshRunner Air", rarity: "UNCOMMON", price: 89, performance: 70, power: 0,
    description: "All-mesh front panel. Airflow first, looks second.",
    metadata: { size: "MID", formFactors: ["ITX", "MATX", "ATX"], maxGpuLength: 340, maxCoolerHeight: 170, maxRadiator: 360, airflow: 88, color: "#262B45", trim: "#4A5690", glass: false },
  },
  {
    id: "case-sakura", category: "case", name: "SakuraShell", rarity: "RARE", price: 139, performance: 70, power: 0,
    description: "Cherry-blossom pink mid-tower with a glass side and white fans.",
    metadata: { size: "MID", formFactors: ["ITX", "MATX", "ATX"], maxGpuLength: 335, maxCoolerHeight: 165, maxRadiator: 280, airflow: 68, color: "#F7C6D9", trim: "#D98BAE", glass: true },
  },
  {
    id: "case-cloud9", category: "case", name: "Cloud9 Studio", rarity: "EPIC", price: 179, performance: 80, power: 0,
    description: "Snow-white showcase case with a vertical GPU mount.",
    metadata: { size: "MID", formFactors: ["ITX", "MATX", "ATX"], maxGpuLength: 370, maxCoolerHeight: 168, maxRadiator: 360, airflow: 74, color: "#F2F4FF", trim: "#A898E0", glass: true },
  },
  {
    id: "case-arcade", category: "case", name: "Neon Arcade Cab", rarity: "EPIC", price: 229, performance: 82, power: 0,
    description: "Mini arcade-cabinet tower with mint marquee lighting. Insert coin.",
    metadata: { size: "FULL", formFactors: ["MATX", "ATX"], maxGpuLength: 360, maxCoolerHeight: 175, maxRadiator: 360, airflow: 72, color: "#4B3F99", trim: "#3CE6B0", glass: true },
  },
  {
    id: "case-monolith", category: "case", name: "Monolith XL", rarity: "LEGENDARY", price: 349, performance: 91, power: 0,
    description: "Brushed-black slab with room for every flagship part in the lab.",
    metadata: { size: "FULL", formFactors: ["ITX", "MATX", "ATX", "EATX"], maxGpuLength: 440, maxCoolerHeight: 190, maxRadiator: 480, airflow: 90, color: "#14182E", trim: "#F7D58B", glass: true },
  },

  // ───────── CPUS ─────────
  {
    id: "cpu-retrochip-mmx", category: "cpu", name: "RetroChip Pentium MMX", rarity: "COMMON", price: 29, performance: 15, power: 35,
    description: "Single-digit cores and maximum nostalgia. The CD-ROM era lives.",
    metadata: { socket: "LEGACY-4", cores: 1, boostGhz: 1.2 },
  },
  {
    id: "cpu-rh-core-s5", category: "cpu", name: "RH-Core S5", rarity: "UNCOMMON", price: 159, performance: 50, power: 65,
    description: "Six efficient cores. Budget gaming without the fuss.",
    metadata: { socket: "RH-1", cores: 6, boostGhz: 4.5 },
  },
  {
    id: "cpu-novachip-7600", category: "cpu", name: "NovaChip 7600", rarity: "RARE", price: 229, performance: 63, power: 105,
    description: "Six fast cores on the NV-5 platform. Upgrade-friendly.",
    metadata: { socket: "NV-5", cores: 6, boostGhz: 5.1 },
  },
  {
    id: "cpu-rh-core-m5", category: "cpu", name: "RH-Core M5", rarity: "RARE", price: 269, performance: 66, power: 125,
    description: "Ten cores. The streamer's sweet spot.",
    metadata: { socket: "RH-1", cores: 10, boostGhz: 4.9 },
  },
  {
    id: "cpu-novachip-7800x3d", category: "cpu", name: "NovaChip 7800X3D", rarity: "EPIC", price: 449, performance: 88, power: 120,
    description: "Stacked cache monster. Absurd gaming FPS at modest power.",
    metadata: { socket: "NV-5", cores: 8, boostGhz: 5.0 },
  },
  {
    id: "cpu-rh-core-x7", category: "cpu", name: "RH-Core X7", rarity: "EPIC", price: 489, performance: 85, power: 180,
    description: "Sixteen cores of all-round power. Needs a good cooler.",
    metadata: { socket: "RH-1", cores: 16, boostGhz: 5.6 },
  },
  {
    id: "cpu-quantum-q0", category: "cpu", name: "Quantum Q-0 Prototype", rarity: "LEGENDARY", price: 899, performance: 96, power: 230,
    description: "Engineering sample that escaped the lab. Unstable? Never.",
    metadata: { socket: "NV-5", cores: 28, boostGhz: 6.2 },
  },

  // ───────── GPUS ─────────
  {
    id: "gpu-pixelforce-710", category: "gpu", name: "PixelForce 710 Potato", rarity: "COMMON", price: 49, performance: 12, power: 30,
    description: "Displays an image. That's the whole feature list.",
    metadata: { length: 150, vram: 2, fans: 1 },
  },
  {
    id: "gpu-radiant-580", category: "gpu", name: "Radiant RX 580 Classic", rarity: "COMMON", price: 119, performance: 28, power: 185,
    description: "A legend of the budget era. Runs warm, runs forever.",
    metadata: { length: 240, vram: 8, fans: 2 },
  },
  {
    id: "gpu-radiant-7600", category: "gpu", name: "Radiant RX 7600", rarity: "UNCOMMON", price: 259, performance: 50, power: 165,
    description: "Compact 1080p card that sips power.",
    metadata: { length: 200, vram: 8, fans: 2 },
  },
  {
    id: "gpu-pixelforce-4060", category: "gpu", name: "PixelForce 4060", rarity: "UNCOMMON", price: 289, performance: 53, power: 115,
    description: "Tiny, cool and quiet. Fits almost any case.",
    metadata: { length: 220, vram: 8, fans: 2 },
  },
  {
    id: "gpu-radiant-7800", category: "gpu", name: "Radiant RX 7800", rarity: "RARE", price: 499, performance: 68, power: 263,
    description: "16GB 1440p workhorse with great value per frame.",
    metadata: { length: 267, vram: 16, fans: 2 },
  },
  {
    id: "gpu-pixelforce-7070s", category: "gpu", name: "PixelForce 7070 Super", rarity: "RARE", price: 649, performance: 74, power: 220,
    description: "Efficient high-refresh 1440p with frame generation magic.",
    metadata: { length: 290, vram: 12, fans: 3 },
  },
  {
    id: "gpu-mint-8080", category: "gpu", name: "PixelForce 8080 Mint Edition", rarity: "EPIC", price: 1099, performance: 87, power: 340,
    description: "Limited mint shroud, glowing logo, 4K muscle.",
    metadata: { length: 330, vram: 20, fans: 3 },
  },
  {
    id: "gpu-pixelforce-9080", category: "gpu", name: "PixelForce 9080", rarity: "LEGENDARY", price: 1299, performance: 91, power: 360,
    description: "The flagship's little sibling. Still enormous.",
    metadata: { length: 330, vram: 24, fans: 3 },
  },
  {
    id: "gpu-radiant-9900", category: "gpu", name: "Radiant RX 9900 XTX", rarity: "LEGENDARY", price: 1499, performance: 93, power: 400,
    description: "32GB of red-hot rasterisation power.",
    metadata: { length: 345, vram: 32, fans: 3 },
  },

  // ───────── MOTHERBOARDS ─────────
  {
    id: "mobo-novaboard-lite", category: "motherboard", name: "NovaBoard Lite", rarity: "COMMON", price: 99, performance: 42, power: 35,
    description: "Budget ATX board for NovaChips. Heads up: DDR4 only.",
    metadata: { socket: "NV-5", formFactor: "ATX", ramType: "DDR4", maxRamGb: 64, m2Slots: 1 },
  },
  {
    id: "mobo-novaboard-b", category: "motherboard", name: "NovaBoard B", rarity: "UNCOMMON", price: 139, performance: 55, power: 40,
    description: "Micro-ATX DDR5 board with two M.2 slots.",
    metadata: { socket: "NV-5", formFactor: "MATX", ramType: "DDR5", maxRamGb: 128, m2Slots: 2 },
  },
  {
    id: "mobo-pixelboard-mini", category: "motherboard", name: "PixelBoard Mini", rarity: "RARE", price: 229, performance: 68, power: 45,
    description: "Mini-ITX DDR5 board for RH-Core small-form-factor builds.",
    metadata: { socket: "RH-1", formFactor: "ITX", ramType: "DDR5", maxRamGb: 96, m2Slots: 2 },
  },
  {
    id: "mobo-pixelboard-gaming", category: "motherboard", name: "PixelBoard Gaming", rarity: "RARE", price: 199, performance: 72, power: 50,
    description: "ATX DDR5 board with a mint heatsink and solid VRMs.",
    metadata: { socket: "RH-1", formFactor: "ATX", ramType: "DDR5", maxRamGb: 128, m2Slots: 2 },
  },
  {
    id: "mobo-novaboard-extreme", category: "motherboard", name: "NovaBoard Extreme", rarity: "LEGENDARY", price: 649, performance: 96, power: 65,
    description: "Extended-ATX NovaChip flagship with water-block VRMs.",
    metadata: { socket: "NV-5", formFactor: "EATX", ramType: "DDR5", maxRamGb: 256, m2Slots: 4 },
  },
  {
    id: "mobo-singularity", category: "motherboard", name: "Singularity Board Ω", rarity: "MYTHIC", price: 1099, performance: 100, power: 70,
    description: "Five M.2 slots, 512GB support and a tiny pixel-art screen.",
    metadata: { socket: "NV-5", formFactor: "EATX", ramType: "DDR5", maxRamGb: 512, m2Slots: 5 },
  },

  // ───────── RAM ─────────
  {
    id: "ram-basic-16-ddr5", category: "ram", name: "BasicRAM 16 DDR5", rarity: "COMMON", price: 45, performance: 40, power: 5,
    description: "16GB DDR5-4800. Entry ticket to the new platforms.",
    metadata: { ramType: "DDR5", capacityGb: 16, speed: 4800, sticks: 2 },
  },
  {
    id: "ram-cloud-32-ddr4", category: "ram", name: "CloudRAM 32 DDR4", rarity: "UNCOMMON", price: 79, performance: 58, power: 7,
    description: "32GB DDR4-3600. Great for older boards.",
    metadata: { ramType: "DDR4", capacityGb: 32, speed: 3600, sticks: 2 },
  },
  {
    id: "ram-mint-32", category: "ram", name: "MintRAM 32 RGB", rarity: "RARE", price: 139, performance: 74, power: 9,
    description: "32GB DDR5-6400 with mint light bars.",
    metadata: { ramType: "DDR5", capacityGb: 32, speed: 6400, sticks: 2 },
  },
  {
    id: "ram-quantum-64-ddr4", category: "ram", name: "QuantumRAM 64 DDR4", rarity: "RARE", price: 159, performance: 66, power: 12,
    description: "64GB DDR4-3600 quad kit. Big capacity, older tech.",
    metadata: { ramType: "DDR4", capacityGb: 64, speed: 3600, sticks: 4 },
  },
  {
    id: "ram-neon-96", category: "ram", name: "NeonRAM 96", rarity: "EPIC", price: 329, performance: 87, power: 11,
    description: "96GB DDR5-6400 in just two sticks.",
    metadata: { ramType: "DDR5", capacityGb: 96, speed: 6400, sticks: 2 },
  },
  {
    id: "ram-quantum-192", category: "ram", name: "QuantumRAM 192", rarity: "LEGENDARY", price: 699, performance: 95, power: 16,
    description: "192GB DDR5-6000. For people who render the universe.",
    metadata: { ramType: "DDR5", capacityGb: 192, speed: 6000, sticks: 4 },
  },

  // ───────── STORAGE ─────────
  {
    id: "ssd-tape-archive", category: "storage", name: "TapeVault 20TB", rarity: "COMMON", price: 79, performance: 18, power: 9,
    description: "Huge, cheap and gloriously slow. Pack a lunch for load times.",
    metadata: { interface: "SATA", capacityTb: 20, readMbs: 120 },
  },
  {
    id: "ssd-bytedrive-500", category: "storage", name: "ByteDrive 500GB", rarity: "COMMON", price: 35, performance: 40, power: 4,
    description: "Small NVMe boot drive. Fast but fills up quickly.",
    metadata: { interface: "NVME", capacityTb: 0.5, readMbs: 3500 },
  },
  {
    id: "ssd-bytedrive-2tb-sata", category: "storage", name: "ByteDrive 2TB SATA", rarity: "UNCOMMON", price: 99, performance: 50, power: 5,
    description: "Roomy SATA SSD. Works with every board in the lab.",
    metadata: { interface: "SATA", capacityTb: 2, readMbs: 560 },
  },
  {
    id: "ssd-zoomdrive-1tb", category: "storage", name: "ZoomDrive 1TB Gen4", rarity: "RARE", price: 89, performance: 64, power: 5,
    description: "1TB Gen4 NVMe. The best value upgrade around.",
    metadata: { interface: "NVME", capacityTb: 1, readMbs: 7000 },
  },
  {
    id: "ssd-hyperdrive-2tb", category: "storage", name: "HyperDrive 2TB Gen5", rarity: "EPIC", price: 229, performance: 86, power: 7,
    description: "Gen5 speed with a finned heatsink.",
    metadata: { interface: "NVME", capacityTb: 2, readMbs: 12000 },
  },
  {
    id: "ssd-warpdrive-4tb", category: "storage", name: "WarpDrive 4TB", rarity: "LEGENDARY", price: 399, performance: 90, power: 8,
    description: "4TB of Gen5 warp speed.",
    metadata: { interface: "NVME", capacityTb: 4, readMbs: 12400 },
  },

  // ───────── PSUS ─────────
  {
    id: "psu-powerunit-550", category: "psu", name: "PowerUnit 550", rarity: "COMMON", price: 55, performance: 42, power: 0,
    description: "550W Bronze. Honest power for honest rigs.",
    metadata: { wattage: 550, efficiency: "BRONZE", modular: false },
  },
  {
    id: "psu-powerunit-750", category: "psu", name: "PowerUnit 750", rarity: "UNCOMMON", price: 99, performance: 62, power: 0,
    description: "750W Gold. Room to grow.",
    metadata: { wattage: 750, efficiency: "GOLD", modular: false },
  },
  {
    id: "psu-powerunit-750-sfx", category: "psu", name: "PowerUnit 750 SFX", rarity: "RARE", price: 149, performance: 68, power: 0,
    description: "Compact 750W Gold modular unit made for small cases.",
    metadata: { wattage: 750, efficiency: "GOLD", modular: true },
  },
  {
    id: "psu-powerunit-850-plat", category: "psu", name: "PowerUnit 850 Platinum", rarity: "EPIC", price: 179, performance: 80, power: 0,
    description: "850W Platinum, silent at idle.",
    metadata: { wattage: 850, efficiency: "PLATINUM", modular: true },
  },
  {
    id: "psu-powerunit-1000-ti", category: "psu", name: "PowerUnit 1000 Titanium", rarity: "LEGENDARY", price: 269, performance: 90, power: 0,
    description: "1000W Titanium. Peak efficiency for flagship rigs.",
    metadata: { wattage: 1000, efficiency: "TITANIUM", modular: true },
  },

  // ───────── COOLING ─────────
  {
    id: "cool-lowpro-47", category: "cooling", name: "LowPro 47", rarity: "COMMON", price: 25, performance: 38, power: 3,
    description: "47mm slim cooler made for tiny cases.",
    metadata: { type: "AIR", sockets: ["RH-1", "NV-5", "LEGACY-4"], maxTdp: 90, height: 47 },
  },
  {
    id: "cool-turbocooler-rgb", category: "cooling", name: "TurboCooler RGB", rarity: "UNCOMMON", price: 55, performance: 60, power: 5,
    description: "The TurboCooler with a glowing fan and beefier fins.",
    metadata: { type: "AIR", sockets: ["RH-1", "NV-5"], maxTdp: 180, height: 158 },
  },
  {
    id: "cool-slimfrost-67", category: "cooling", name: "SlimFrost 67", rarity: "RARE", price: 59, performance: 62, power: 4,
    description: "67mm low-profile cooler that punches above its height.",
    metadata: { type: "AIR", sockets: ["RH-1", "NV-5"], maxTdp: 140, height: 67 },
  },
  {
    id: "cool-iceloop-280", category: "cooling", name: "IceLoop 280", rarity: "EPIC", price: 159, performance: 85, power: 10,
    description: "280mm AIO with two big quiet fans. Needs 280mm mounts.",
    metadata: { type: "AIO", sockets: ["RH-1", "NV-5"], maxTdp: 280, radiator: 280 },
  },
  {
    id: "cool-auroraloop-360", category: "cooling", name: "AuroraLoop 360 LCD", rarity: "LEGENDARY", price: 269, performance: 92, power: 13,
    description: "360mm AIO with a pump-cap screen showing pixel art.",
    metadata: { type: "AIO", sockets: ["RH-1", "NV-5"], maxTdp: 330, radiator: 360 },
  },
  {
    id: "cool-iceloop-420", category: "cooling", name: "IceLoop 420", rarity: "LEGENDARY", price: 239, performance: 94, power: 14,
    description: "420mm AIO. Only the biggest towers can mount it.",
    metadata: { type: "AIO", sockets: ["RH-1", "NV-5"], maxTdp: 360, radiator: 420 },
  },

  // ───────── MONITORS ─────────
  {
    id: "mon-pocketview-15", category: "monitor", name: "PocketView 15 Portable", rarity: "COMMON", price: 89, performance: 20, power: 0,
    description: '15" USB-C portable screen. Couch-to-café ready.',
    metadata: { sizeIn: 15, resolution: "1080P", refreshHz: 60 },
  },
  {
    id: "mon-swiftpixel-27", category: "monitor", name: "SwiftPixel 27", rarity: "UNCOMMON", price: 249, performance: 60, power: 0,
    description: '27" 1440p 165Hz. The mainstream sweet spot.',
    metadata: { sizeIn: 27, resolution: "1440P", refreshHz: 165 },
  },
  {
    id: "mon-trinitube-21", category: "monitor", name: "TriniTube CRT 21", rarity: "RARE", price: 259, performance: 58, power: 0,
    description: '21" flat-face CRT. Heavy as a fridge, smooth as butter.',
    metadata: { sizeIn: 21, resolution: "1600×1200", refreshHz: 100, crt: true },
  },
  {
    id: "mon-pixelview-34uw", category: "monitor", name: "PixelView 34 Ultrawide", rarity: "EPIC", price: 799, performance: 88, power: 0,
    description: '34" curved 3440×1440 at 175Hz.',
    metadata: { sizeIn: 34, resolution: "3440×1440", refreshHz: 175, ultrawide: true },
  },
  {
    id: "mon-pixelview-27-4k", category: "monitor", name: "PixelView 27 4K OLED", rarity: "LEGENDARY", price: 999, performance: 93, power: 0,
    description: '27" 4K OLED at 240Hz. Every pixel a jewel.',
    metadata: { sizeIn: 27, resolution: "4K", refreshHz: 240 },
  },
  {
    id: "mon-holoview-57", category: "monitor", name: "HoloView 57 Ω", rarity: "MYTHIC", price: 2499, performance: 100, power: 0,
    description: '57" dual-4K ultrawide at 240Hz. A whole wall of game.',
    metadata: { sizeIn: 57, resolution: "7680×2160", refreshHz: 240, ultrawide: true },
  },

  // ───────── KEYBOARDS ─────────
  {
    id: "kb-budgetmech", category: "keyboard", name: "BudgetMech 87", rarity: "COMMON", price: 39, performance: 35, power: 2,
    description: "Cheap and cheerful TKL with red switches and rainbow LEDs.",
    metadata: { layout: "TKL", switches: "Linear Red", rgb: true },
  },
  {
    id: "kb-clackboard-full", category: "keyboard", name: "ClackBoard Full", rarity: "UNCOMMON", price: 79, performance: 52, power: 2,
    description: "Full-size mechanical with brown switches and a numpad.",
    metadata: { layout: "FULL", switches: "Tactile Brown", rgb: false },
  },
  {
    id: "kb-pastelkeys", category: "keyboard", name: "PastelKeys 65 Wireless", rarity: "RARE", price: 139, performance: 70, power: 2,
    description: "Compact wireless board in lilac and peach.",
    metadata: { layout: "60%", switches: "Silent Linear", rgb: true },
  },
  {
    id: "kb-split-ergo", category: "keyboard", name: "SplitErgo Dactyl", rarity: "EPIC", price: 229, performance: 82, power: 3,
    description: "Split ergonomic board. Your wrists will write you thank-you notes.",
    metadata: { layout: "TKL", switches: "Tactile Silent", rgb: false },
  },
  {
    id: "kb-typewriter-royal", category: "keyboard", name: "TypeWriter Royal", rarity: "LEGENDARY", price: 299, performance: 90, power: 2,
    description: "Buckling-spring legend with brass round keycaps.",
    metadata: { layout: "TKL", switches: "Buckling Spring", rgb: false, retro: true },
  },
  {
    id: "kb-omega-analog", category: "keyboard", name: "KeyForge Ω Analog", rarity: "MYTHIC", price: 499, performance: 100, power: 4,
    description: "Analog magnetic switches with per-key actuation and light shows.",
    metadata: { layout: "FULL", switches: "Analog Magnetic", rgb: true },
  },

  // ───────── MICE ─────────
  {
    id: "mouse-ballmouse", category: "mouse", name: "BallMouse 1998", rarity: "COMMON", price: 5, performance: 10, power: 1,
    description: "Real rubber ball inside. Clean it monthly.",
    metadata: { dpi: 400, weightG: 110, wireless: false, rgb: false },
  },
  {
    id: "mouse-glide-wireless", category: "mouse", name: "GlideMouse Wireless", rarity: "UNCOMMON", price: 49, performance: 55, power: 1,
    description: "The comfy GlideMouse, now cable-free.",
    metadata: { dpi: 12000, weightG: 85, wireless: true, rgb: false },
  },
  {
    id: "mouse-pixelmouse-mmo", category: "mouse", name: "PixelMouse MMO", rarity: "RARE", price: 69, performance: 64, power: 2,
    description: "Twelve side buttons for all your hotkeys.",
    metadata: { dpi: 18000, weightG: 110, wireless: false, rgb: true },
  },
  {
    id: "mouse-pastel-mini", category: "mouse", name: "PastelMouse Mini", rarity: "RARE", price: 89, performance: 72, power: 1,
    description: "Small-hand wireless mouse with a soft lilac glow.",
    metadata: { dpi: 16000, weightG: 58, wireless: true, rgb: true },
  },
  {
    id: "mouse-featherlite-39", category: "mouse", name: "FeatherLite 39", rarity: "LEGENDARY", price: 159, performance: 92, power: 1,
    description: "39 grams. Basically a polite cloud.",
    metadata: { dpi: 32000, weightG: 39, wireless: true, rgb: false },
  },
  {
    id: "mouse-omega", category: "mouse", name: "Quantum Mouse Ω", rarity: "MYTHIC", price: 299, performance: 100, power: 1,
    description: "35g magnesium shell, 8K wireless and a sensor that reads minds.",
    metadata: { dpi: 44000, weightG: 35, wireless: true, rgb: true },
  },
];
