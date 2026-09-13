import test from "node:test";
import assert from "node:assert/strict";
import { select } from "../src/query.js";
test("protected story results never appear before opt-in and source snippets are never indexed", () => {
  const r = {
    id: "story",
    title: "sensitive-ending",
    versions: ["ps4"],
    sequence: 1,
    entityIds: [],
    story: true,
    note: "unindexed-source-excerpt",
  };
  assert.deepEqual(
    select([r], [], { version: "ps4", q: "sensitive-ending" }),
    [],
  );
  assert.equal(
    select([r], [], { version: "ps4", q: "sensitive-ending", spoilers: true })
      .length,
    1,
  );
  assert.deepEqual(
    select([r], [], {
      version: "ps4",
      q: "unindexed-source-excerpt",
      spoilers: true,
    }),
    [],
  );
});
