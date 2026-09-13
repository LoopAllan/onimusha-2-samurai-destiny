import test from "node:test";
import assert from "node:assert/strict";
const engine = await import("../src/engine.js").catch(() => ({}));
const action = () => ({
  id: "give",
  versions: ["ps2"],
  status: "verified",
  start: 0,
  expire: 2,
  all: [],
  any: [],
  conflicts: [],
  costs: { melon: 1 },
  rewards: { ring: 1 },
  rewardType: "deterministic",
  companion: null,
  affinity: null,
});
const state = () => ({
  version: "ps2",
  stage: 0,
  events: [],
  inventory: { melon: 1 },
  companions: [],
  affinity: {},
});
test("available exchange consumes inventory and grants deterministic reward once", () => {
  assert.equal(typeof engine.applyAction, "function");
  const s = state();
  const next = engine.applyAction(action(), s);
  assert.equal(next.inventory.melon, 0);
  assert.equal(next.inventory.ring, 1);
  assert.deepEqual(s.inventory, { melon: 1 });
  assert.throws(() => engine.applyAction(action(), next));
});

test("eligibility fails closed at version, stage, prerequisites, inventory and uncertainty boundaries", () => {
  assert.equal(typeof engine.evaluate, "function");
  for (const [a, s, expected] of [
    [action(), state(), "ready"],
    [{ ...action(), versions: ["ps4"] }, state(), "version"],
    [{ ...action(), status: "unknown" }, state(), "unknown"],
    [action(), { ...state(), stage: 2 }, "expired"],
    [{ ...action(), start: 1 }, state(), "future"],
    [
      { ...action(), all: ["a", "b"] },
      { ...state(), events: ["a"] },
      "prerequisite",
    ],
    [{ ...action(), any: ["a", "b"] }, state(), "prerequisite"],
    [{ ...action(), any: ["a", "b"] }, { ...state(), events: ["b"] }, "ready"],
    [action(), { ...state(), inventory: {} }, "inventory"],
    [
      { ...action(), conflicts: ["a"] },
      { ...state(), events: ["a"] },
      "conflict",
    ],
    [{ ...action(), companion: "oyu" }, state(), "companion"],
    [
      { ...action(), affinity: { recipient: "oyu", min: 5 } },
      state(),
      "affinity",
    ],
    [{ ...action(), expire: null }, state(), "unknown"],
    [{ ...action(), status: "conflicting" }, state(), "unknown"],
  ]) {
    assert.equal(engine.evaluate(a, s).code, expected);
    if (expected !== "ready") assert.throws(() => engine.applyAction(a, s));
  }
});

test("possible rewards never become owned until separately observed; unknown reward blocks", () => {
  const a = { ...action(), rewardType: "possible" };
  assert.equal(engine.applyAction(a, state()).inventory.ring, undefined);
  assert.equal(
    engine.evaluate({ ...a, rewardType: "unknown" }, state()).code,
    "unknown",
  );
});
