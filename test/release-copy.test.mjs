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

test("release copy states the smithy boundary without implying all first-visit Imasho is complete", () => {
  const home = pages.find((page) => page.key === "home").html;
  const walkthrough = pages.find((page) => page.key === "walkthrough").html;
  assert.match(home, /今庄初訪・城鎮探索/);
  assert.match(walkthrough, /鍛冶屋取得弓/);
  assert.match(walkthrough, /山道、通行證、首次送禮與礦山仍待後續查證/);
  assert.match(walkthrough, /編輯建議順序/);
  assert.match(walkthrough, /白墨交換鏈.*再訪/);
  assert.doesNotMatch(walkthrough, /後續今庄流程仍維持研究中|終點為取得舞雷刀/);
  assert.doesNotMatch(readme, /opening Yagyu Village slice only/);
});
