import { test } from "node:test";
import assert from "node:assert/strict";
import { PRESETS } from "@/data/presets";
import { COMPONENTS } from "@/data/components";
import { CATEGORIES } from "@/types/game";
import { checkCandidate, evaluateSelection, getComponent, resolveSelection, canFinish, checkChallenge, challengeForDate, decodeSelection, encodeSelection } from "./index";

test("catalog has enough unique, valid components", () => {
  assert.ok(COMPONENTS.length >= 40);
  assert.equal(new Set(COMPONENTS.map((c) => c.id)).size, COMPONENTS.length);
  for (const cat of CATEGORIES) assert.ok(COMPONENTS.filter((c) => c.category === cat).length >= 5, cat);
  assert.ok(COMPONENTS.filter((c) => c.category === "gpu").length >= 8);
});

test("presets are complete and conflict-free", () => {
  for (const p of PRESETS) {
    const s = evaluateSelection(p.selection);
    assert.ok(s.complete, p.key);
    assert.deepEqual(s.conflicts.filter((c) => c.severity === "error"), [], p.key);
    console.log(`${p.key.padEnd(10)} score=${s.score.total} rarity=${s.rarity} value=${s.value} draw=${s.power.draw}`, s.score.categories);
  }
});

test("mythic parts can reach MYTHIC, flagship stays below", () => {
  const mythic = evaluateSelection({
    case: "case-prism", cpu: "cpu-quantum-q1", gpu: "gpu-neon-titan", motherboard: "mobo-novaboard-pro", ram: "ram-hyper-256",
    storage: "ssd-infinity-vault", psu: "psu-reactorcore-1600", cooling: "cool-cryocore", monitor: "mon-horizon-49", keyboard: "kb-aurora", mouse: "mouse-zenith",
  });
  assert.deepEqual(mythic.conflicts, []);
  assert.equal(mythic.rarity, "MYTHIC");
  assert.ok(mythic.score.total <= 100);
  assert.equal(evaluateSelection(PRESETS[0].selection).rarity, "LEGENDARY");
});

test("socket, ram, case, gpu, cooler and psu rules fire", () => {
  const parts = resolveSelection({ cpu: "cpu-rh-core-x9", case: "case-pocketbox", psu: "psu-powerunit-450" });
  const ids = (id: string) => checkCandidate(parts, getComponent(id)!).map((c) => c.id);
  assert.ok(ids("mobo-novaboard-pro").includes("cpu-socket"));
  assert.ok(ids("mobo-novaboard-pro").includes("case-form-factor"));
  assert.ok(ids("gpu-neon-titan").includes("gpu-length"));
  assert.ok(ids("gpu-neon-titan").includes("psu-capacity"));
  assert.ok(ids("cool-turbocooler").includes("cooler-height"));
  assert.ok(ids("cool-stockfan").includes("cooler-tdp"));
  const ddr = resolveSelection({ motherboard: "mobo-pixelboard-b" });
  assert.ok(checkCandidate(ddr, getComponent("ram-cloud-64")!).some((c) => c.id === "ram-type"));
  const retro = resolveSelection({ motherboard: "mobo-retroboard-4l", cpu: "cpu-retrochip-486", case: "case-retrobox" });
  assert.ok(checkCandidate(retro, getComponent("ssd-bytedrive-2tb")!).some((c) => c.id === "storage-m2"));
  assert.ok(checkCandidate(retro, getComponent("cool-frosttower")!).some((c) => c.id === "cooler-socket"));
  assert.ok(checkCandidate(retro, getComponent("cool-iceloop-240")!).some((c) => c.id === "cooler-radiator"));
});

test("chaos mode allows conflicting builds but penalises score", () => {
  const sel = { ...PRESETS[0].selection, case: "case-pocketbox" };
  const s = evaluateSelection(sel);
  assert.ok(s.conflicts.some((c) => c.severity === "error"));
  assert.equal(canFinish(s.parts, s.conflicts, false).ok, false);
  assert.equal(canFinish(s.parts, s.conflicts, true).ok, true);
  assert.ok(s.score.total < evaluateSelection(PRESETS[0].selection).score.total);
});

test("challenges and encoding", () => {
  const budget = evaluateSelection(PRESETS[1].selection);
  assert.deepEqual(checkChallenge({ maxBudget: 2000, minRamGb: 16 }, budget), []);
  assert.ok(checkChallenge({ maxPower: 100 }, budget).length > 0);
  assert.equal(challengeForDate("2026-10-06").id, "2026-10-06");
  assert.deepEqual(decodeSelection(encodeSelection(PRESETS[2].selection)), PRESETS[2].selection);
});
