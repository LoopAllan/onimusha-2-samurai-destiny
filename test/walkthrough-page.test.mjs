import test from "node:test";
import assert from "node:assert/strict";
import { renderSite } from "../scripts/site.mjs";

test("walkthrough page exposes the evidence-backed runtime mount", () => {
  const html = renderSite().find((page) => page.key === "walkthrough").html;
  assert.match(html, /id="walkthrough-root"/);
  assert.match(html, /<script type="module" src="\.\/src\/walkthrough-app\.js"><\/script>/);
  assert.doesNotMatch(html, /本頁目前是獨立研究工作區/);
});
