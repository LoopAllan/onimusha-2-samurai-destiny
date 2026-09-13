import { cp, mkdir, rm, readFile, writeFile } from "node:fs/promises";
import { validate } from "../src/validate.js";
const root = new URL("../", import.meta.url);
const errors = validate(
  JSON.parse(await readFile(new URL("data/guide.json", root), "utf8")),
);
if (errors.length) throw new Error(errors.join("\n"));
await rm(new URL("dist/", root), { recursive: true, force: true });
await mkdir(new URL("dist/", root));
for (const path of ["index.html", "src", "data", "assets"])
  await cp(new URL(path, root), new URL(`dist/${path}`, root), {
    recursive: true,
  });
await writeFile(new URL("dist/.nojekyll", root), "");
console.log(
  "Static build complete: dist/ (relative assets, no runtime dependencies).",
);
