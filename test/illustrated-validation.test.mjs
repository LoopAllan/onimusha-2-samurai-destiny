import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validate } from "../src/validate.js";

test("illustrated core entities fail closed for missing details, route references, and malformed rich text", async () => {
  const data = JSON.parse(await readFile(new URL("../data/guide.json", import.meta.url), "utf8"));
  const missing = structuredClone(data); delete missing.entities.find((entity) => entity.id === "chalk").detail;
  assert.ok(validate(missing).some((error) => /missing illustrated detail/.test(error)));
  const route = structuredClone(data); route.entities.find((entity) => entity.id === "chalk").detail.mapGuidance[0].routeId = "missing";
  assert.ok(validate(route).some((error) => /unknown route/.test(error)));
  const leakage = structuredClone(data); leakage.entities.find((entity) => entity.id === "melon").detail.explanation.find((entry) => entry.versions.includes("ps4")).versions = ["ps2"];
  assert.ok(validate(leakage).some((error) => /source version coverage missing/.test(error)));
  const ps4Melon = data.entities.find((entity) => entity.id === "melon");
  assert.equal(ps4Melon.en.ps4, "Cantaloupe");
  const ps4Necklace = data.entities.find((entity) => entity.id === "necklace").detail.acquisition.find((entry) => entry.versions.includes("ps4"));
  assert.doesNotMatch(ps4Necklace.text, /ジュジュドーマ/);
});
