import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validate } from "../src/validate.js";
import { applyAction, evaluate } from "../src/engine.js";
import { initialState } from "../src/progress.js";
const data = await readFile(
  new URL("../data/guide.json", import.meta.url),
  "utf8",
)
  .then(JSON.parse)
  .catch(() => null);
test("shipped sourced route is playable for each separately supported version", () => {
  assert.ok(data, "real guide dataset exists");
  assert.deepEqual(validate(data), []);
  for (const version of ["ps2", "ps4"]) {
    let s = initialState(version);
    s.stage = 1;
    for (const suffix of ["chalk", "heike", "emblem", "melon", "deliver"])
      s = applyAction(
        data.actions.find((a) => a.id === `${version}-${suffix}`),
        s,
      );
    assert.equal(s.inventory.melon, 0);
    s.stage = 2;
    s = applyAction(
      data.actions.find((a) => a.id === `${version}-necklace`),
      s,
    );
    assert.equal(s.inventory.necklace, 1);
    assert.equal(
      evaluate(
        data.actions.find((a) => a.id === `${version}-deliver`),
        { ...initialState(version), stage: 2 },
      ).code,
      "expired",
    );
  }
  assert.equal(
    evaluate(
      data.actions.find((a) => a.id === "ps4-necklace"),
      { ...initialState("ps4"), stage: 3 },
    ).code,
    "unknown",
  );
  assert.ok(data.sources.every((s) => !s.url.includes("example.")));
});

test("PS2 chalk collection window is conservatively bounded, not inferred from Remaster hard expiry", () => {
  assert.equal(
    evaluate(
      data.actions.find((a) => a.id === "ps2-chalk"),
      { ...initialState("ps2"), stage: 2 },
    ).code,
    "unknown",
  );
});
