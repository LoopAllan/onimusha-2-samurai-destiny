import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validate } from "../src/validate.js";
import { walkthroughView } from "../src/walkthrough-model.js";
const data = JSON.parse(await readFile(new URL("../data/guide.json", import.meta.url), "utf8"));
const ids = ["mountain-path-pickups", "mountain-guard", "mountain-buy-permit", "mountain-mine-entrance"];

test("mountain continuation reaches only the mine entrance with per-version claim evidence", () => {
  for (const version of ["ps2", "ps4"]) {
    const steps = walkthroughView(data, version).filter((s) => s.id.startsWith("mountain-"));
    assert.deepEqual(steps.map((s) => s.id), ids);
    assert.deepEqual(steps.map((s) => s.sequence), [100, 110, 120, 130]);
    assert.ok(steps.every((s) => !s.missable && !s.irreversible && !s.leavesArea));
    assert.equal(steps[0].kind, "optional");
    assert.equal(steps.at(-1).kind, "boundary");
    const source = version === "ps2" ? "gamechronicles-yagyu" : "solo-imasho-first";
    for (const step of steps) {
      assert.deepEqual(step.sources.map((s) => s.id), [source]);
      for (const instruction of step.instructions)
        assert.deepEqual(instruction.sources.map((s) => s.id), [source]);
    }
    const permit = steps[2];
    assert.match(permit.instructions.map((i) => i.text).join(" "), /100/);
    const names = new Map(steps.flatMap((s) => s.entities).map((e) => [e.id, e.names]));
    assert.equal(names.get("mountain-permit").en.text, version === "ps2" ? "Permit" : "Mountain Permit");
    assert.equal(names.get("unique-mushrooms").en.text, version === "ps2" ? "Unique Mushroom" : "Unique Mushrooms");
    assert.equal(names.get("history-book-4").en.text, version === "ps2" ? "History Book #4" : "History Book Vol. 4");
    for (const name of names.values()) {
      assert.equal(name.zhTw.status, "editorial");
      assert.equal(name.en.status, "source-listed");
      assert.equal(name.ja.status, "pending");
      assert.deepEqual(name.en.sourceIds, [source]);
    }
    const prose = steps.map((s) => [s.title, s.summary, ...s.instructions.map((i) => i.text)].join(" ")).join(" ");
    assert.doesNotMatch(prose, /7000|2300|20秒|30秒|必須送|永久|第二個畫面|第一個畫面/);
    assert.match(steps.at(-1).summary, /不進入礦坑/);
  }
  assert.deepEqual(validate(data), []);
});
