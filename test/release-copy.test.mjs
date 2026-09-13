import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { renderSite } from "../scripts/site.mjs";

const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
const pages = renderSite();

test("README describes the live automatic Pages release contract", () => {
  assert.match(readme, /https:\/\/loopallan\.github\.io\/onimusha-2-samurai-destiny\//);
  assert.match(readme, /push to `main`.*automatically deploys/i);
  assert.doesNotMatch(readme, /No deployment has been performed/);
  assert.doesNotMatch(readme, /manual-only/);
});

test("generated phase copy advertises both published slices without stale first-phase wording", () => {
  const home = pages.find((page) => page.key === "home").html;
  assert.match(home, /walkthrough\.html/);
  assert.match(home, /companions\.html/);
  assert.doesNotMatch(home, /目前可操作的研究切片是角色送禮交換手帖/);
  for (const page of pages) assert.doesNotMatch(page.html, /非官方攻略 · 第一階段/);
});
