import test from "node:test";
import assert from "node:assert/strict";
import { evaluate, applyAction } from "../src/engine.js";
const a = {
  id: "give",
  versions: ["ps4"],
  status: "verified",
  start: 0,
  expire: 1,
  windowKind: "verification",
  all: [],
  any: [],
  conflicts: [],
  costs: { x: 1 },
  rewards: {},
  rewardType: "deterministic",
  consumption: "returned",
};
const s = {
  version: "ps4",
  stage: 0,
  events: [],
  inventory: { x: 1 },
  companions: [],
  affinity: {},
  history: [],
};
test("end of researched window is unknown not a claimed hard expiry; rejected gift returns item", () => {
  assert.equal(evaluate(a, { ...s, stage: 1 }).code, "unknown");
  assert.equal(applyAction(a, s).inventory.x, 1);
  assert.deepEqual(applyAction(a, s).history, ["give"]);
});
