import test from "node:test";
import assert from "node:assert/strict";
import { validateAssets } from "../scripts/validate-assets.mjs";

test("media validator accepts registered local original SVG and rejects tampering or unsafe markup", async () => {
  const media = [{ id: "thumb", kind: "original-svg", path: "assets/items/chalk.svg", mime: "image/svg+xml", width: 320, height: 180, bytes: 1, sha256: "0".repeat(64), alt: "示意", caption: "原創", provenance: { type: "project-original", evidenceSourceIds: ["source"], statement: "原創" } }];
  const base = await validateAssets({ media, renderedPaths: ["assets/items/chalk.svg"], root: new URL("../", import.meta.url) });
  assert.ok(base.some((error) => /bytes|sha256/.test(error)));
  const unsafe = await validateAssets({ media: [{ ...media[0], path: "../outside.svg" }], renderedPaths: [], root: new URL("../", import.meta.url) });
  assert.ok(unsafe.some((error) => /path/.test(error)));
});
