import test from "node:test";
import assert from "node:assert/strict";
const mod = await import("../src/validate.js").catch(() => ({}));
// Synthetic records exist only in tests.
export const fixture = () => ({
  sources: [
    {
      id: "source",
      url: "https://example.org/evidence",
      versions: ["ps2"],
      title: "Test source",
    },
  ],
  entities: [
    {
      id: "item",
      name: "測試",
      en: null,
      ja: null,
      aliases: [],
      versions: ["ps2"],
      sourceIds: ["source"],
      region: "JP",
      confidence: "single-source",
      status: "verified",
      verifiedAt: "2026-09-13",
      note: "Test only",
    },
  ],
  stages: [
    { id: "start", name: "開始" },
    { id: "end", name: "結束" },
  ],
  actions: [
    {
      id: "get",
      title: "取得",
      entityIds: ["item"],
      versions: ["ps2"],
      sourceIds: ["source"],
      region: "JP",
      confidence: "single-source",
      status: "verified",
      verifiedAt: "2026-09-13",
      note: "Test only",
      sequence: 1,
      start: 0,
      expire: 1,
      windowKind: "hard",
      all: [],
      any: [],
      conflicts: [],
      costs: {},
      rewards: { item: 1 },
      rewardType: "deterministic",
      companion: null,
      recipient: null,
      affinity: null,
    },
  ],
});
test("validator accepts normalized source-scoped records and rejects unknown IDs, cycles, malformed quantities and leakage", () => {
  assert.equal(typeof mod.validate, "function");
  assert.deepEqual(mod.validate(fixture()), []);
  for (const mutate of [
    (d) => (d.actions[0].costs = { missing: 1 }),
    (d) => (d.actions[0].all = ["get"]),
    (d) => (d.actions[0].rewards.item = -1),
    (d) => (d.actions[0].expire = "1"),
    (d) => (d.actions[0].versions = ["ps4"]),
    (d) => (d.actions[0].sourceIds = ["missing"]),
    (d) => d.entities.push({ ...d.entities[0] }),
    (d) => (d.actions[0].status = "invented"),
    (d) => (d.actions[0].affinity = { recipient: "missing", min: NaN }),
    (d) => (d.actions[0].any = "get"),
  ]) {
    const d = fixture();
    mutate(d);
    assert.ok(mod.validate(d).length, JSON.stringify(d));
  }
});

test("shared entities require aggregate source coverage, not each source covering both versions", () => {
  const d = fixture();
  d.sources.push({ ...d.sources[0], id: "ps4-source", versions: ["ps4"] });
  d.entities[0].versions = ["ps2", "ps4"];
  d.entities[0].sourceIds.push("ps4-source");
  assert.deepEqual(mod.validate(d), []);
});

test("optional rule fields and raw source URLs are strictly validated without throwing", () => {
  for (const mutate of [
    (d) => (d.actions[0].elapsed = { item: "item", min: -1, max: 10 }),
    (d) => (d.actions[0].elapsed = { item: "missing", min: 0, max: 10 }),
    (d) => (d.actions[0].history = "get"),
    (d) => (d.actions[0].history = ["missing"]),
    (d) => (d.actions[0].consumption = "sometimes"),
    (d) => (d.actions[0].windowKind = "guess"),
    (d) => (d.actions[0].versions = "ps2"),
    (d) => (d.sources[0].url = "https://user@example.org/"),
    (d) => (d.sources[0].url = "https:///example.org"),
    (d) => (d.sources[0].url = "https://example.org/\nthing"),
    (d) => (d.actions[0].recommendedBefore = "1"),
    (d) => (d.actions[0].story = "yes"),
  ]) {
    const d = fixture();
    mutate(d);
    let errors;
    assert.doesNotThrow(() => {
      errors = mod.validate(d);
    });
    assert.ok(errors.length, JSON.stringify(d));
  }
});
