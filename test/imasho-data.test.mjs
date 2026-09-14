import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validate } from "../src/validate.js";
import { walkthroughView } from "../src/walkthrough-model.js";
const data = JSON.parse(await readFile(new URL("../data/guide.json", import.meta.url), "utf8"));
const ids = ["imasho-arrival", "imasho-bar-pickups", "imasho-market-stable", "imasho-smithy-bow"];

test("first Imasho town exploration is a bounded four-step slice with independent version evidence", () => {
  for (const version of ["ps2", "ps4"]) {
    const all = walkthroughView(data, version);
    const steps = all.filter((step) => step.id.startsWith("imasho-"));
    assert.deepEqual(steps.map((step) => step.id), ids);
    assert.deepEqual(steps.map((step) => step.sequence), [60, 70, 80, 90]);
    assert.equal(all.length, 9);
    assert.ok(steps.every((step) => !step.irreversible && !step.missable && !step.leavesArea));
    assert.ok(steps.every((step) => step.kind === "optional"));
    const entities = new Set(steps.flatMap((step) => step.entities.map((entity) => entity.id)));
    assert.deepEqual([...entities].sort(), ["imasho-town", "sugar-candy", "kiseru", "folding-fan", "globe", "ancient-documents", "tengu-mask", "imasho-town-map", "cloth", "bow"].sort());
    const routeSource = version === "ps2" ? "gamechronicles-yagyu" : "solo-imasho-first";
    for (const step of steps) {
      for (const instruction of step.instructions) {
        assert.ok(instruction.sources.some((source) => source.id === routeSource));
        assert.ok(instruction.sources.every((source) => source.versions.includes(version)));
      }
      for (const entity of step.entities) {
        assert.equal(entity.names.zhTw.status, "editorial");
        for (const record of Object.values(entity.names)) {
          for (const id of record.sourceIds)
            assert.ok(data.sources.find((source) => source.id === id).versions.includes(version));
        }
      }
    }
    assert.doesNotMatch(steps.map((step) => step.instructions.map((i) => i.text).join(" ")).join(" "), /保證|永久|必須送|2300|七小時|7小時/);
  }
  assert.deepEqual(validate(data), []);
});

test("Imasho arrival title uses only the unidentified-man wording supported by route sources", () => {
  const arrival = data.walkthroughSteps.find((step) => step.id === "imasho-arrival");
  assert.equal(arrival.title, "抵達今庄，先和街口男子交談");
  assert.doesNotMatch(arrival.title, /商人/);
});

test("Remaster Imasho route citation uses a retrievable dated archive", () => {
  const source = data.sources.find((record) => record.id === "solo-imasho-first");
  assert.match(source.url, /^https:\/\/web\.archive\.org\/web\/20260109071255id_\/https:\/\/www\.soloplayguide\.com\//);
  assert.match(source.support, /Wayback replay/);
});
