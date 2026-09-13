import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validate } from "../src/validate.js";

const loadGuide = async () =>
  JSON.parse(
    await readFile(new URL("../data/guide.json", import.meta.url), "utf8"),
  );

test("walkthrough records fail closed for malformed order, scope, and evidence", async () => {
  const data = await loadGuide();
  data.walkthroughSteps = [
    {
      id: "opening-start",
      sequence: "1",
      versions: [],
      region: "",
      status: "verified",
      confidence: "",
      verifiedAt: "not-a-date",
      sourceIds: ["missing-source"],
      kind: "guess",
      title: "",
      instructions: [],
      entityIds: ["missing-entity"],
      missable: "no",
      irreversible: "no",
      leavesArea: "no",
    },
  ];

  const errors = validate(data);
  for (const expected of [
    "invalid sequence",
    "invalid versions",
    "missing region",
    "missing confidence",
    "invalid verification date",
    "unknown sources ID missing-source",
    "invalid walkthrough kind",
    "missing title",
    "missing instructions",
    "unknown entities ID missing-entity",
    "invalid missable",
    "invalid irreversible",
    "invalid leavesArea",
  ]) {
    assert.ok(
      errors.some((error) => error.includes(expected)),
      `${expected}: ${errors.join("; ")}`,
    );
  }
});

test("walkthrough instructions require claim-level text and same-version sources", async () => {
  const data = await loadGuide();
  data.walkthroughSteps = [
    {
      id: "opening-start",
      sequence: 1,
      versions: ["ps4"],
      region: "Remaster English UI",
      status: "source-checked",
      confidence: "single-community-source",
      verifiedAt: "2026-09-13",
      sourceIds: ["app-melon"],
      kind: "required",
      title: "開始探索",
      instructions: [{ text: "", sourceIds: ["xgm-town"] }],
      entityIds: ["jubei"],
      missable: false,
      irreversible: false,
    },
  ];

  const errors = validate(data);
  assert.ok(errors.some((error) => error.includes("invalid instruction text")));
  assert.ok(
    errors.some((error) => error.includes("instruction source version coverage missing")),
    errors.join("; "),
  );
});

test("walkthrough rejects duplicate records, missing relations, and incomplete source provenance", async () => {
  const data = await loadGuide();
  data.walkthroughSteps.push(structuredClone(data.walkthroughSteps[0]));
  delete data.walkthroughSteps[0].summary;
  delete data.walkthroughSteps[0].entityIds;
  const source = data.sources.find((record) => record.id === "solo-yagyu-opening");
  delete source.accessedAt;
  source.support = "";
  const errors = validate(data).join("\n");
  assert.match(errors, /yagyu-village-path: duplicate walkthrough ID/);
  assert.match(errors, /yagyu-village-path: missing summary/);
  assert.match(errors, /yagyu-village-path: malformed entityIds/);
  assert.match(errors, /solo-yagyu-opening: missing accessedAt/);
  assert.match(errors, /solo-yagyu-opening: missing support/);
});

test("conflicting localized names retain sources without selecting an unsupported winner", async () => {
  const data = await loadGuide();
  const entity = data.entities.find((record) => record.id === "charity-orb");
  entity.names.en.ps2 = {
    text: null,
    status: "conflicting",
    sourceIds: ["gamechronicles-yagyu", "ign-yagyu-act-1"],
  };
  assert.deepEqual(validate(data), []);
});

test("name evidence sources must be represented in entity provenance", async () => {
  const data = await loadGuide();
  const entity = data.entities.find((record) => record.id === "herb");
  entity.names.en.ps2.sourceIds = ["ign-yagyu-act-1"];
  const errors = validate(data);
  assert.ok(
    errors.some((error) => error.includes("name evidence source missing from entity sourceIds")),
    errors.join("\n"),
  );
});

test("versioned entity names reject unsupported status and source leakage", async () => {
  const data = await loadGuide();
  const entity = data.entities.find((record) => record.id === "chalk");
  entity.names = {
    "zh-TW": {
      ps4: { text: "白墨", status: "official", sourceIds: [] },
    },
    en: {
      ps4: { text: "Chalk", status: "source-listed", sourceIds: ["xgm-gifts"] },
    },
    ja: {
      ps4: { text: null, status: "pending", sourceIds: ["app-melon"] },
    },
  };

  const errors = validate(data);
  for (const expected of [
    "invalid name evidence status",
    "name source version coverage missing",
    "pending name must not cite sources",
  ]) {
    assert.ok(
      errors.some((error) => error.includes(expected)),
      `${expected}: ${errors.join("; ")}`,
    );
  }
});
