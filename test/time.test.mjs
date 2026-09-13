import test from "node:test";
import assert from "node:assert/strict";
import { evaluate } from "../src/engine.js";
const a = {
  id: "combo",
  versions: ["ps2"],
  status: "verified",
  start: 0,
  expire: 2,
  all: [],
  any: [],
  conflicts: [],
  costs: {},
  rewards: {},
  rewardType: "deterministic",
  elapsed: { item: "fruit", min: 10, max: 20 },
  history: ["gift-a", "gift-b"],
};
const s = {
  version: "ps2",
  stage: 0,
  events: [],
  inventory: {},
  companions: [],
  affinity: {},
  playMinutes: 15,
  acquiredAt: { fruit: 0 },
  history: ["gift-a", "gift-b"],
};
test("elapsed rules use explicit game minutes, combo is consecutive and interrupted by map changes", () => {
  assert.equal(evaluate(a, { ...s, playMinutes: 9 }).code, "time");
  assert.equal(evaluate(a, s).code, "ready");
  assert.equal(evaluate(a, { ...s, playMinutes: 20 }).code, "time");
  assert.equal(evaluate(a, { ...s, playMinutes: undefined }).code, "unknown");
  assert.equal(
    evaluate(a, { ...s, history: ["gift-a", "map-change", "gift-b"] }).code,
    "history",
  );
});

test("grants timestamp items in explicit game time for later age checks", async () => {
  const { applyAction } = await import("../src/engine.js");
  const grant = {
    ...a,
    id: "get",
    elapsed: null,
    history: [],
    rewards: { fruit: 1 },
  };
  const result = applyAction(grant, { ...s, acquiredAt: {}, history: [] });
  assert.equal(result.acquiredAt.fruit, 15);
});
