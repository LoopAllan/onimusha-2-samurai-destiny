import test from "node:test";
import assert from "node:assert/strict";
const mod = await import("../src/query.js");
test("reverse item links and warning lists include blocked expiring steps without claiming ready", () => {
  assert.equal(typeof mod.itemRelations, "function");
  const records = [
    {
      id: "get",
      costs: {},
      rewards: { x: 1 },
      all: [],
      any: [],
      versions: ["ps2"],
      start: 0,
      expire: 1,
      status: "verified",
      rewardType: "deterministic",
      conflicts: [],
      companion: null,
      affinity: null,
    },
    {
      id: "give",
      costs: { x: 1 },
      rewards: {},
      all: ["get"],
      any: [],
      versions: ["ps2"],
      start: 0,
      expire: 1,
      status: "verified",
      rewardType: "deterministic",
      conflicts: [],
      companion: null,
      affinity: null,
    },
  ];
  assert.deepEqual(mod.itemRelations(records, "x"), {
    upstream: ["get"],
    downstream: ["give"],
  });
  assert.deepEqual(mod.itemRelations(records, "none"), {
    upstream: [],
    downstream: [],
  });
  const lists = mod.guidance(records, {
    version: "ps2",
    stage: 0,
    events: [],
    inventory: {},
    companions: [],
    affinity: {},
  });
  assert.deepEqual(
    lists.now.map((a) => a.id),
    ["get"],
  );
  assert.deepEqual(
    lists.before.map((a) => a.id),
    ["get", "give"],
  );
});
