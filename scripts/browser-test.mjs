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
  if (process.env.SCREENSHOT_DIR) {
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
