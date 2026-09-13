import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
test("static build validates data and uses relative URLs for Pages subpath", () => {
  assert.ok(existsSync("scripts/build.mjs"), "build script exists");
  const r = spawnSync(process.execPath, ["scripts/build.mjs"], {
    encoding: "utf8",
  });
  assert.equal(r.status, 0, r.stderr);
  const html = readFileSync("dist/index.html", "utf8");
  assert.match(html, /lang="zh-TW"/);
  assert.match(html, /src="\.\/src\/app.js"/);
  assert.ok(existsSync("dist/data/guide.json"));
  assert.doesNotMatch(html, /(?:src|href)="\/(?!\/)/);
  assert.ok(!existsSync("dist/test"));
});
