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
  assert.match(html, /src="\.\/src\/shell.js"/);
  assert.doesNotMatch(html, /src="\.\/src\/app.js"/);
  assert.match(
    readFileSync("dist/companions.html", "utf8"),
    /src="\.\/src\/app.js"/,
  );
  assert.ok(existsSync("dist/data/guide.json"));
  assert.doesNotMatch(html, /(?:src|href)="\/(?!\/)/);
  assert.ok(!existsSync("dist/test"));
});

test("CI installs Chromium before the complete test suite", () => {
  const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
  const install = workflow.indexOf("npx playwright install --with-deps chromium");
  const testSuite = workflow.indexOf("- run: npm test");
  assert.ok(install >= 0, "CI installs Chromium");
  assert.ok(testSuite >= 0, "CI runs the complete test suite");
  assert.ok(install < testSuite, "Chromium must be ready before npm test");
});

test("Pages deploys after a main merge with Chromium ready for tests", () => {
  const workflow = readFileSync(".github/workflows/pages.yml", "utf8");
  const mainPush = workflow.indexOf("push:\n    branches: [main]");
  const manualOnly = workflow.indexOf("workflow_dispatch:");
  const install = workflow.indexOf("npx playwright install --with-deps chromium");
  const testSuite = workflow.indexOf("- run: npm test");
  assert.ok(mainPush >= 0, "Pages workflow deploys on main push");
  assert.equal(manualOnly, -1, "Pages workflow no longer requires manual dispatch");
  assert.ok(install >= 0 && install < testSuite, "Chromium is ready before tests");
});
