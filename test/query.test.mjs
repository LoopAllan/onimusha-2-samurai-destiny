import test from "node:test";
import assert from "node:assert/strict";
const query = await import("../src/query.js").catch(() => ({}));
const records = [
  {
    id: "late",
    versions: ["ps2"],
    sequence: 2,
    recipient: "oyu",
    start: 0,
    expire: 2,
    entityIds: ["melon"],
    all: ["early"],
    any: [],
    costs: { melon: 1 },
    rewards: {},
  },
  {
    id: "early",
    versions: ["ps2"],
    sequence: 1,
    recipient: null,
    start: 0,
    expire: 2,
    entityIds: ["melon"],
    all: [],
    any: [],
    costs: {},
    rewards: { melon: 1 },
  },
];
const entities = [
  { id: "melon", name: "哈密瓜", en: null, ja: "メロン", aliases: ["甜瓜"] },
];
test("query resolves aliases, filters scope and orders chain", () => {
  assert.equal(typeof query.select, "function");
  assert.deepEqual(
    query
      .select(records, entities, { version: "ps2", stage: 0, q: "甜瓜" })
      .map((x) => x.id),
    ["early", "late"],
  );
  assert.equal(
    query.select(records, entities, { version: "ps4", q: "" }).length,
    0,
  );
  assert.equal(
    query.select(records, entities, { version: "ps2", stage: 2, q: "" }).length,
    0,
  );
  assert.equal(
    query.select(records, entities, {
      version: "ps2",
      recipient: "oyu",
      q: "メロン",
    }).length,
    1,
  );
});
