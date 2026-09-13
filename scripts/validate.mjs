import { readFile } from "node:fs/promises";
import { validate } from "../src/validate.js";
const data = JSON.parse(
  await readFile(new URL("../data/guide.json", import.meta.url), "utf8"),
);
const errors = validate(data);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Validated ${data.actions.length} actions, ${data.entities.length} entities, ${data.sources.length} sources.`,
  );
