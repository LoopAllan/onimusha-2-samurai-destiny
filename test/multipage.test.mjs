import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve } from "node:path";
import { chromium } from "playwright";

const pages = [
  ["home", "index.html"],
  ["walkthrough", "walkthrough.html"],
  ["companions", "companions.html"],
  ["collectibles", "collectibles.html"],
  ["equipment", "equipment.html"],
  ["maps", "maps.html"],
  ["combat", "combat.html"],
  ["postgame", "postgame.html"],
];
const expectedHrefs = pages.map(([, file]) => `./${file}`);

async function builtPages() {
  const result = spawnSync(process.execPath, ["scripts/build.mjs"], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  return Promise.all(
    pages.map(async ([key, file]) => [
      key,
      file,
      await readFile(`dist/${file}`, "utf8"),
    ]),
  );
}

function navigation(html) {
  return [...html.matchAll(/<a\b[^>]*class="nav-link"[^>]*>/g)].map(
    ([tag]) => ({
      href: tag.match(/\bhref="([^"]+)"/)?.[1],
      current: tag.match(/\baria-current="([^"]+)"/)?.[1],
    }),
  );
}

async function serveDist() {
  const base = resolve("dist");
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      const relativePath = decodeURIComponent(url.pathname).replace(
        /^\/onimusha-2\//,
        "",
      );
      const file = resolve(
        base,
        relativePath === "/" || relativePath === ""
          ? "index.html"
          : relativePath,
      );
      if (!file.startsWith(`${base}/`)) throw new Error("invalid path");
      const body = await readFile(file);
      response.setHeader(
        "Content-Type",
        {
          ".html": "text/html",
          ".js": "text/javascript",
          ".json": "application/json",
          ".css": "text/css",
          ".svg": "image/svg+xml",
        }[extname(file)] ?? "text/plain",
      );
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end();
    }
  }).listen(0, "127.0.0.1");
  await new Promise((resolveListening) => server.on("listening", resolveListening));
  return server;
}

test("multipage build contract", async (t) => {
  const documents = await builtPages();

  await t.test("builds eight distinct category documents", () => {
    assert.equal(documents.length, 8);
    assert.equal(new Set(documents.map(([, , html]) => html)).size, 8);
    assert.deepEqual(
      documents.map(([key, file, html]) => [
        key,
        file,
        html.includes(`data-page="${key}"`),
      ]),
      pages.map(([key, file]) => [key, file, true]),
    );
  });

  await t.test("shares normal navigation and marks only the current page", () => {
    for (const [key, file, html] of documents) {
      const links = navigation(html);
      assert.deepEqual(
        links.map(({ href }) => href),
        expectedHrefs,
        `${file} navigation links`,
      );
      assert.deepEqual(
        links.flatMap(({ href, current }) =>
          current ? [[href, current]] : [],
        ),
        [[`./${file}`, "page"]],
        `${key} current page`,
      );
      assert.doesNotMatch(html, /class="nav-link"[^>]*href="#[^"]*"/);
    }
  });

  await t.test("isolates the current notebook and intentional page content", () => {
    const byKey = new Map(documents.map(([key, , html]) => [key, html]));
    for (const [key, , html] of documents) {
      assert.equal(
        html.includes('data-content="companions-notebook"'),
        key === "companions",
        `${key} notebook isolation`,
      );
    }
    assert.doesNotMatch(byKey.get("home"), /id="(?:chain|inventory|stage)"/);
    for (const key of [
      "walkthrough",
      "collectibles",
      "equipment",
      "maps",
      "combat",
      "postgame",
    ]) {
      assert.match(byKey.get(key), /data-status="research-in-progress"/);
    }
    const headings = documents.map(([, , html]) =>
      html.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1].replace(/<[^>]+>/g, "").trim(),
    );
    assert.equal(new Set(headings).size, 8, "each page has an intentional heading");
  });

  await t.test("navigates direct, reload, back and forward under a Pages subpath", async () => {
    const server = await serveDist();
    let browser;
    try {
      browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox"],
      });
      const page = await browser.newPage();
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      const root = `http://127.0.0.1:${server.address().port}/onimusha-2/`;

      await page.goto(root);
      assert.equal(await page.locator('[aria-current="page"]').count(), 1);
      await page.locator('nav a[href="./companions.html"]').click();
      await page.waitForURL(`${root}companions.html`);
      await page.waitForSelector('[data-content="companions-notebook"]');
      await page.reload();
      assert.equal(await page.locator("#version").inputValue(), "ps4");

      await page.locator('nav a[href="./maps.html"]').click();
      await page.waitForURL(`${root}maps.html`);
      await page.goBack();
      await page.waitForURL(`${root}companions.html`);
      await page.goForward();
      await page.waitForURL(`${root}maps.html`);
      await page.goto(`${root}postgame.html`);
      assert.equal(
        await page.locator('[aria-current="page"]').getAttribute("href"),
        "./postgame.html",
      );
      assert.deepEqual(pageErrors, []);
    } finally {
      if (browser) await browser.close();
      await new Promise((resolveClosed) => server.close(resolveClosed));
    }
  });
});
