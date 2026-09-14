import { chromium } from "playwright";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
const base = resolve("dist");
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const path = decodeURIComponent(url.pathname).replace(/^\/guide\//, "");
    const file = resolve(
      base,
      path === "/" || path === "" ? "index.html" : path,
    );
    if (!file.startsWith(base + "/")) throw Error();
    const body = await readFile(file);
    res.setHeader(
      "Content-Type",
      {
        ".html": "text/html",
        ".js": "text/javascript",
        ".json": "application/json",
        ".css": "text/css",
        ".svg": "image/svg+xml",
      }[extname(file)] ?? "text/plain",
    );
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
}).listen(0, "127.0.0.1");
await new Promise((r) => server.on("listening", r));
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/guide/`);
  assert.equal(
    await page.locator('[aria-current="page"]').getAttribute("href"),
    "./index.html",
  );
  await page.locator('nav a[href="./companions.html"]').click();
  await page.waitForURL(
    `http://127.0.0.1:${server.address().port}/guide/companions.html`,
  );
  await page.waitForSelector("#version", { timeout: 5000 });
  await page.reload();
  await page.goBack();
  await page.waitForURL(`http://127.0.0.1:${server.address().port}/guide/`);
  await page.goForward();
  await page.waitForURL(
    `http://127.0.0.1:${server.address().port}/guide/companions.html`,
  );
  await page.waitForSelector('[data-content="companions-notebook"]');
  assert.equal(await page.locator("#version").inputValue(), "ps4");
  assert.equal(await page.locator("nav a").count(), 8);
  assert.match(
    await page.locator('[data-entity="chalk"] small').first().innerText(),
    /Chalk/,
  );
  const chalkLink = page.locator('[data-entity="chalk"]').first();
  assert.equal(await chalkLink.getAttribute("href"), "companions.html#entity-chalk");
  await chalkLink.focus();
  await page.waitForSelector('[role="tooltip"]:not([hidden])');
  assert.equal(await chalkLink.getAttribute("aria-describedby"), "entity-tooltip");
  assert.equal(await page.locator('[role="tooltip"] img').count(), 1);
  assert.equal(await page.locator('[role="tooltip"] img').getAttribute("src"), "./assets/items/chalk.svg");
  await page.keyboard.press("Escape");
  assert.equal(await chalkLink.getAttribute("aria-describedby"), null);
  assert.equal(await page.locator('[role="tooltip"]').count(), 1);
  let skippedWarnings = 0;
  const dismissAdvance = async (dialog) => {
    skippedWarnings++;
    await dialog.dismiss();
  };
  page.on("dialog", dismissAdvance);
  for (const target of ["2", "3"]) {
    await page.selectOption("#stage", target);
    await page.locator("#apply-stage").click();
    assert.equal(
      await page.locator("#stage").inputValue(),
      "0",
      `unsafe jump to ${target}`,
    );
  }
  page.off("dialog", dismissAdvance);
  assert.equal(skippedWarnings, 2);
  await page.selectOption("#stage", "1");
  await page.locator("#apply-stage").click();
  assert.equal(await page.locator("#chain article").count(), 6);
  for (const id of ["chalk", "heike", "emblem", "melon", "deliver"])
    await page.locator(`[data-complete="ps4-${id}"]`).click();
  assert.match(await page.locator("#inventory").innerText(), /哈密瓜.*0/s);
  await page.reload();
  assert.equal(
    await page.locator('[data-complete="ps4-deliver"]').isDisabled(),
    true,
  );
  await page.selectOption("#stage", "2");
  await page.locator("#apply-stage").click();
  await page.locator('[data-complete="ps4-necklace"]').click();
  assert.match(await page.locator("#inventory").innerText(), /橙色首飾.*1/s);
  await page.selectOption("#version", "ps2");
  assert.equal(await page.locator("#stage").inputValue(), "0");
  await page.selectOption("#version", "ps4");
  assert.equal(await page.locator("#stage").inputValue(), "2");
  await page.fill("#search", "甜瓜");
  assert.ok((await page.locator("#chain article").count()) > 0);
  await page.fill("#search", "not-in-guide");
  assert.equal(await page.locator("#chain article").count(), 0);
  await page.fill("#search", "");
  await page.selectOption("#recipient", "kotaro");
  assert.equal(await page.locator("#chain article").count(), 1);
  await page.selectOption("#recipient", "");
  await page.selectOption("#stage-filter", "1");
  assert.equal(await page.locator("#chain article").count(), 5);
  await page.selectOption("#stage-filter", "");
  await page.locator('[data-entity="melon"]').first().click();
  await page.waitForSelector("#entity-melon");
  assert.match(await page.locator("#item-detail").innerText(), /Cantaloupe/);
  assert.match(await page.locator("#item-detail").innerText(), /原創非空間互動示意/);
  await page.evaluate(() => localStorage.setItem("other-app", "keep"));
  page.once("dialog", (d) => d.accept());
  await page.locator("#reset").click();
  assert.equal(await page.locator("#stage").inputValue(), "0");
  assert.equal(
    await page.evaluate(() => localStorage.getItem("other-app")),
    "keep",
  );
  for (const width of [360, 768, 1280]) {
    await page.setViewportSize({ width, height: 850 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `overflow at ${width}`,
    );
  }
  await page.setViewportSize({ width: 360, height: 850 });
  await page.locator("#menu").click();
  assert.equal(
    await page.locator("#menu").getAttribute("aria-expanded"),
    "true",
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page.locator("#menu").getAttribute("aria-expanded"),
    "false",
  );
  assert.ok((await page.locator("small").count()) > 0);
  await page.selectOption("#stage", "1");
  await page.locator("#apply-stage").click();
  await page.selectOption("#stage", "2");
  page.once("dialog", (d) => d.dismiss());
  await page.locator("#apply-stage").click();
  assert.equal(await page.locator("#stage").inputValue(), "1");
  await page.selectOption("#stage", "2");
  page.once("dialog", (d) => d.accept());
  await page.locator("#apply-stage").click();
  assert.equal(
    await page.locator('[data-complete="ps4-deliver"]').isDisabled(),
    true,
  );
  await page.selectOption("#stage", "0");
  await page.locator("#apply-stage").click();
  assert.equal(await page.locator("#stage").inputValue(), "2");
  await page.locator("#spoilers").check();
  assert.equal(await page.locator("#chain article").count(), 6);
  const corpus = JSON.parse(await readFile("data/guide.json", "utf8"));
  for (const variant of ["no-recipient", "unknown-window"]) {
    const data = structuredClone(corpus);
    const action = data.actions.find((record) => record.id === "ps2-chalk");
    if (variant === "no-recipient") action.recipient = null;
    else {
      action.start = null;
      action.expire = null;
    }
    const probe = await browser.newPage();
    const probeErrors = [];
    probe.on("pageerror", (error) => probeErrors.push(error.message));
    await probe.route("**/data/guide.json", (route) =>
      route.fulfill({ json: data }),
    );
    await probe.goto(
      `http://127.0.0.1:${server.address().port}/guide/companions.html`,
    );
    await probe.waitForFunction(
      () =>
        document.querySelector("#chain article") ||
        document
          .querySelector("#storage-status")
          .textContent.includes("無法啟動"),
    );
    assert.doesNotMatch(
      await probe.locator("#storage-status").innerText(),
      /無法啟動/,
      variant,
    );
    await probe.selectOption("#version", "ps2");
    assert.equal(await probe.locator("#chain article").count(), 6, variant);
    if (variant === "unknown-window") {
      assert.match(
        await probe.locator("#ps2-chalk").innerText(),
        /時間窗待查證/,
      );
      assert.equal(
        await probe.locator('[data-complete="ps2-chalk"]').isDisabled(),
        true,
      );
    }
    assert.deepEqual(probeErrors, [], variant);
    await probe.close();
  }
  await page.goto(
    `http://127.0.0.1:${server.address().port}/guide/walkthrough.html`,
  );
  await page.waitForSelector("#walkthrough-root article", { timeout: 5000 });
  assert.equal(await page.locator("#walkthrough-root article").count(), 9);
  assert.deepEqual(
    await page.locator("#walkthrough-root article").evaluateAll((nodes) =>
      nodes.map((node) => Number(node.dataset.sequence)),
    ),
    [10, 20, 30, 40, 50, 60, 70, 80, 90],
  );
  assert.match(await page.locator("#yagyu-village-path").innerText(), /Yagyu Village Map/);
  assert.match(await page.locator("#yagyu-village-path").innerText(), /日文 名稱待核/);
  assert.match(await page.locator("#yagyu-dragon-shrine").innerText(), /離開目前區域/);
  assert.doesNotMatch(await page.locator("#yagyu-dragon-shrine").innerText(), /不可逆推進/);
  const ps4SourceTitles = await page
    .locator("#walkthrough-sources a")
    .evaluateAll((links) => links.map((link) => link.textContent));
  assert.deepEqual(ps4SourceTitles, [
    "Yagyu Village (1st Visit) — Onimusha 2 Remaster",
    "Onimusha 2: Samurai's Destiny Remaster walkthrough part 1 — YouTube",
    "02. Imasho Town - 1st Visit — Onimusha 2 Remaster",
  ]);
  assert.equal(await page.locator("#walkthrough-root .walkthrough-instructions .citation-line").count() > 0, true);
  assert.ok(
    await page.locator("#walkthrough-sources a").evaluateAll((links) =>
      links.every((link) => link.target === "_blank" && link.rel === "noopener noreferrer"),
    ),
  );
  await page.selectOption("#version", "ps2");
  assert.match(await page.locator("#yagyu-village-path").innerText(), /柳生の庄の地図/);
  assert.match(await page.locator("#yagyu-village-path").innerText(), /Map of the Yagyu Village/);
  assert.match(await page.locator("#walkthrough-root").innerText(), /EN 名稱來源衝突/);
  const ps2SourceTitles = await page
    .locator("#walkthrough-sources a")
    .evaluateAll((links) => links.map((link) => link.textContent));
  assert.deepEqual(ps2SourceTitles, [
    "XGameMania：今庄の町 注10・17",
    "Onimusha 2 Walkthrough v1.0 — Yagyu Village / Imasho Town",
    "Walkthrough: Act 1 — Jubei's Village",
    "鬼武者2 攻略情報サイト — 柳生の庄",
    "鬼武者2 攻略情報サイト — 重要アイテム",
    "鬼武者2 攻略情報サイト — 回復／強化アイテム",
    "鬼武者2 攻略情報サイト — 書物",
    "Onimusha 2: Samurai's Destiny — Gift Item FAQ",
  ]);
  assert.ok(!ps2SourceTitles.includes("Yagyu Village (1st Visit) — Onimusha 2 Remaster"));
  assert.ok(!ps2SourceTitles.includes("Onimusha 2: Samurai's Destiny Remaster walkthrough part 1 — YouTube"));
  for (const version of ["ps4", "ps2", "ps4"]) {
    await page.selectOption("#version", version);
    const isRemaster = version === "ps4";
    assert.equal(await page.locator('#walkthrough-root article[id^="imasho-"]').count(), 4);
    const town = await page.locator('#walkthrough-root article[id^="imasho-"]').allInnerTexts();
    assert.match(town[0], isRemaster ? /EN Sugar Candy/ : /EN Confetti/);
    assert.match(town[1], isRemaster ? /EN Kiseru/ : /EN Pipe/);
    assert.match(town[3], isRemaster ? /EN Bow\s/ : /EN Bow and Arrows/);
    assert.ok(town.every((text) => !/不可逆推進|離開目前區域/.test(text)));
    const expectedTitle = isRemaster
      ? "02. Imasho Town - 1st Visit — Onimusha 2 Remaster"
      : "Onimusha 2 Walkthrough v1.0 — Yagyu Village / Imasho Town";
    const claimTitles = await page.locator('article[id^="imasho-"] .walkthrough-instructions .citation-line a').allTextContents();
    assert.deepEqual(claimTitles, Array(9).fill(expectedTitle));
    assert.equal(await page.locator('article[id^="imasho-"] .walkthrough-entity').count(), 10);
    assert.equal(await page.locator('article[id^="imasho-"] .name-editorial').count(), 10);
    assert.equal(await page.locator('article[id^="imasho-"] .name-in-game-verified').count(), isRemaster ? 9 : 0);
    assert.deepEqual(await page.locator("#walkthrough-sources a").allTextContents(), isRemaster ? ps4SourceTitles : ps2SourceTitles);
  }
  for (const width of [360, 768, 1280]) {
    await page.setViewportSize({ width, height: 850 });
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `walkthrough overflow at ${width}`,
    );
  }
  await page.goto(`http://127.0.0.1:${server.address().port}/guide/walkthrough.html#imasho-arrival`);
  await page.waitForSelector("#imasho-arrival");
  await page.waitForFunction(() => {
    const rect = document.querySelector("#imasho-arrival").getBoundingClientRect();
    return rect.top >= 0 && rect.top < innerHeight;
  });
  assert.match(await page.locator(".walkthrough-intro").innerText(), /山道、通行證、首次送禮與礦山仍待後續查證/);
  for (const version of ["ps2", "ps4"]) {
    await page.selectOption("#version", version);
    for (const width of [320, 360, 768, 1280]) {
      await page.setViewportSize({ width, height: 850 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `walkthrough ${version} overflow at ${width}`);
    }
  }
  if (process.env.SCREENSHOT_DIR) {
    await page.setViewportSize({ width: 360, height: 850 });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: `${process.env.SCREENSHOT_DIR}/mobile.png`,
      fullPage: true,
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.screenshot({
      path: `${process.env.SCREENSHOT_DIR}/desktop.png`,
      fullPage: true,
    });
  }
  assert.deepEqual(errors, []);
  console.log(
    "Browser PASS: multipage subpath direct/reload/back-forward, full PS4 chain, persisted/version-isolated progress, scoped reset, aliases, filters, upstream/downstream, 360/768/1280 overflow, menu Escape, no JS errors.",
  );
} finally {
  if (browser) await browser.close();
  await new Promise((resolveClosed) => server.close(resolveClosed));
}
