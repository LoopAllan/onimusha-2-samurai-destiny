import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validate } from "../src/validate.js";
import { walkthroughView } from "../src/walkthrough-model.js";

const data = JSON.parse(
  await readFile(new URL("../data/guide.json", import.meta.url), "utf8"),
);

const expectedIds = [
  "yagyu-village-path",
  "yagyu-pond-pickups",
  "yagyu-meet-takajo",
  "yagyu-residence-checklist",
  "yagyu-dragon-shrine",
];

test("published opening walkthrough is a complete version-separated Yagyu Village slice", () => {
  assert.deepEqual(validate(data), []);
  for (const version of ["ps2", "ps4"]) {
    const steps = walkthroughView(data, version);
    assert.deepEqual(steps.map((step) => step.id), expectedIds, version);
    assert.ok(steps.every((step) => step.status !== "in-game-verified"));
    assert.ok(steps.every((step) => step.missable === false));
    const charity = steps.flatMap((step) => step.entities).find((entity) => entity.id === "charity-orb");
    if (version === "ps2") assert.equal(charity.names.en.status, "conflicting");
    else assert.equal(charity.names.en.status, "in-game-verified");
    assert.equal(steps.at(-1).leavesArea, true);
    assert.equal(steps.at(-1).irreversible, false);
  }
});

test("opening entities expose explicit name evidence without claiming a verified Traditional Chinese localization", () => {
  const ids = new Set(data.walkthroughSteps.flatMap((step) => step.entityIds));
  assert.ok(ids.size >= 15, `expected a complete opening checklist, received ${ids.size}`);
  for (const id of ids) {
    const entity = data.entities.find((record) => record.id === id);
    assert.ok(entity?.names, `${id} names`);
    for (const version of entity.versions) {
      assert.notEqual(entity.names["zh-TW"][version].status, "in-game-verified", `${id} ${version}`);
      for (const language of ["zh-TW", "en", "ja"])
        assert.ok(entity.names[language][version], `${id} ${language} ${version}`);
    }
  }
});

test("published opening preserves exact cited localized labels and direct Remaster transition provenance", () => {
  const byId = new Map(data.entities.map((entity) => [entity.id, entity]));
  assert.equal(byId.get("four-guardians-right").names.en.ps4.text, "Four Guardians: Right");
  assert.equal(byId.get("four-guardians-left").names.en.ps4.text, "Four Guardians: Left");
  assert.equal(byId.get("yagyu-residence").names.en.ps2.text, "Yagyu's House");
  assert.equal(byId.get("yagyu-residence").names.ja.ps2.status, "pending");
  assert.equal(byId.get("abacus").names.ja.ps2.text, "そろばん");
  assert.deepEqual(byId.get("dragon-shrine").names.en.ps2.sourceIds, ["gamefaqs-17422-archive"]);
  assert.ok(
    data.walkthroughSteps
      .find((step) => step.id === "yagyu-dragon-shrine")
      .instructions.at(-1).sourceIds.includes("remaster-opening-video"),
  );
});
