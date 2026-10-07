import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_GAME_CONFIG as cfg, LAB_BOTS } from "@/data/economy";
import { getComponent } from "@/lib/pc-engine/catalog";
import { leveled } from "@/lib/pc-engine/levels";
import { resolveBattle } from "./battle";
import { evaluateRig, pcLevelFor } from "./rig";
import { pickSlot, rollRoulette, rouletteOdds } from "./roulette";

const seq = (vals: number[]) => {
  let i = 0;
  return () => vals[i++ % vals.length];
};

test("upgrades grow stats per category and cap at max level", () => {
  const gpu = getComponent("gpu-pixelforce-9090")!;
  const l2 = leveled(gpu, 2, cfg.upgrades);
  assert.equal(l2.performance, gpu.performance + 6);
  assert.ok(l2.power > gpu.power);
  assert.deepEqual(leveled(gpu, 9, cfg.upgrades), leveled(gpu, 5, cfg.upgrades));
  const psu = getComponent("psu-powerunit-850")!;
  const p3 = leveled(psu, 3, cfg.upgrades);
  assert.ok(p3.category === "psu" && p3.metadata.wattage > 850);
  assert.equal(leveled(gpu, 1, cfg.upgrades), gpu);
});

test("upgraded rig scores higher", () => {
  const sel = LAB_BOTS[2].selection;
  const base = evaluateRig(sel, {}, cfg);
  const up = evaluateRig(sel, { [sel.gpu!]: 5, [sel.cpu!]: 5, [sel.ram!]: 5 }, cfg);
  assert.ok(up.summary.score.total > base.summary.score.total, `${up.summary.score.total} > ${base.summary.score.total}`);
  assert.ok(up.stats.graphics > base.stats.graphics);
});

test("pc levels", () => {
  assert.equal(pcLevelFor(10, cfg).name, "STARTER");
  assert.equal(pcLevelFor(80, cfg).name, "BEAST");
  assert.equal(pcLevelFor(99, cfg).next, null);
});

test("roulette respects weights and returns real parts", () => {
  assert.equal(pickSlot(cfg.roulette, () => 0).reward.type, "credits");
  assert.deepEqual(pickSlot(cfg.roulette, () => 0.999999).reward, { type: "component", rarity: "MYTHIC" });
  for (let i = 0; i < 200; i++) {
    const r = rollRoulette(cfg, Math.random);
    if (r.type === "component") assert.equal(getComponent(r.componentId)?.rarity, r.rarity);
    else assert.ok(r.amount > 0);
  }
  assert.ok(Math.abs(rouletteOdds(cfg).reduce((s, o) => s + o.pct, 0) - 100) < 1e-9);
});

test("battle: stronger rig wins without variance, breakdown has every stat", () => {
  const strong = evaluateRig(LAB_BOTS[4].selection, {}, cfg).stats;
  const weak = evaluateRig(LAB_BOTS[0].selection, {}, cfg).stats;
  const r = resolveBattle(strong, weak, { ...cfg.battle, variance: 0 }, seq([0.5]));
  assert.equal(r.won, true);
  assert.equal(r.lines.length, 6);
  assert.ok(r.lines.find((l) => l.stat === "graphics")!.diff > 0);
  assert.equal(resolveBattle(weak, strong, { ...cfg.battle, variance: 0 }, seq([0.5])).won, false);
});
