import { cp, mkdir, rm, readFile, writeFile } from "node:fs/promises";
import { validate } from "../src/validate.js";
import { renderSite } from "./site.mjs";
const root = new URL("../", import.meta.url);
const errors = validate(
  JSON.parse(await readFile(new URL("data/guide.json", root), "utf8")),
);
if (errors.length) throw new Error(errors.join("\n"));
await rm(new URL("dist/", root), { recursive: true, force: true });
await mkdir(new URL("dist/", root));
for (const path of ["src", "data", "assets"])
  await cp(new URL(path, root), new URL(`dist/${path}`, root), {
    recursive: true,
  });
for (const page of renderSite())
  await writeFile(new URL(`dist/${page.file}`, root), page.html);
await writeFile(new URL("dist/.nojekyll", root), "");
console.log(
  "Static build complete: dist/ (8 pages, relative assets, no runtime dependencies).",
);
