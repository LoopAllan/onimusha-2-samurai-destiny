import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { guidance } from "../src/query.js";
import { validate } from "../src/validate.js";
import { initialState } from "../src/progress.js";
const corpus = JSON.parse(
  await readFile(new URL("../data/guide.json", import.meta.url), "utf8"),
);

test("advance warnings cover every crossed checkpoint, not only the next one", () => {
  const state = initialState("ps4");
  assert.equal(guidance(corpus.actions, state, 1).before.length, 0);
  assert.ok(
    guidance(corpus.actions, state, 2).before.some(
      (a) => a.id === "ps4-deliver",
    ),
  );
  assert.ok(
    guidance(corpus.actions, state, 3).before.some(
      (a) => a.id === "ps4-necklace",
    ),
  );
  assert.ok(
    guidance(corpus.actions, state, 3).before.every((a) =>
      a.versions.includes("ps4"),
    ),
  );
  state.events = ["ps4-deliver"];
  assert.ok(
    !guidance(corpus.actions, state, 2).before.some(
      (a) => a.id === "ps4-deliver",
    ),
  );
  state.stage = 2;
  assert.equal(guidance(corpus.actions, state, 2).before.length, 0);
  assert.equal(guidance(corpus.actions, state, 1).before.length, 0);
});

test("publishing validator rejects missing display and window semantics with field errors", () => {
  const cases = [
    ["missing title", (d) => delete d.actions[0].title, /title/],
    ["empty title", (d) => (d.actions[0].title = "  "), /title/],
    ["missing stage name", (d) => delete d.stages[0].name, /name/],
    [
      "unknown stage entity",
      (d) => (d.stages[0].entityId = "missing-entity"),
      /unknown entities ID/,
    ],
    [
      "missing window kind",
      (d) => delete d.actions[0].windowKind,
      /windowKind/,
    ],
  ];
  for (const [name, mutate, expected] of cases) {
    const d = structuredClone(corpus);
    mutate(d);
    assert.match(validate(d).join("\n"), expected, name);
  }
});

test("source URLs reject Unicode whitespace and controls without rejecting encoded paths", () => {
  for (const char of ["\u0085", "\u00a0", "\u200b", "\u2028", "\ufeff"]) {
    const d = structuredClone(corpus);
    d.sources[0].url = `https://example.org/path${char}suffix`;
    assert.match(
      validate(d).join("\n"),
      /unsafe source URL/,
      `U+${char.codePointAt(0).toString(16)}`,
    );
  }
  const d = structuredClone(corpus);
  d.sources[0].url = "https://example.org/path%20suffix?lang=ja#section";
  assert.deepEqual(validate(d), []);
});
