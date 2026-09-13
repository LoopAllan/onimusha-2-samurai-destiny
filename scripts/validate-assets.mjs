import { lstat, readFile, realpath } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, sep } from "node:path";

const safeSvg = (text) => !/(<!doctype|<!entity|<script\b|\bon\w+\s*=|<foreignobject\b|<(?:image|use|style|animate|a|iframe)\b|\bhref\s*=|url\s*\()/i.test(text) && /<svg\b[^>]*\bviewBox="0 0 \d+ \d+"/i.test(text);
export async function validateAssets({ media = [], renderedPaths = [], root = new URL("../", import.meta.url) }) {
  const errors = [];
  const base = resolve(root.pathname);
  const seen = new Set();
  for (const item of media) {
    if (!item?.id || seen.has(item.id)) { errors.push("media: duplicate or missing ID"); continue; }
    seen.add(item.id);
    if (item.kind !== "original-svg" || item.mime !== "image/svg+xml" || !/^assets\/(?:chain|items\/[a-z-]+|imasho-shop-route)\.svg$/.test(item.path ?? "")) { errors.push(`${item.id}: unsafe media path`); continue; }
    const file = resolve(base, item.path);
    if (!file.startsWith(base + sep)) { errors.push(`${item.id}: unsafe media path`); continue; }
    try {
      const stat = await lstat(file);
      if (stat.isSymbolicLink() || (await realpath(file)) !== file) throw Error("symlink");
      const body = await readFile(file);
      const text = body.toString("utf8");
      if (!safeSvg(text)) errors.push(`${item.id}: unsafe SVG`);
      if (body.length !== item.bytes) errors.push(`${item.id}: bytes mismatch`);
      if (createHash("sha256").update(body).digest("hex") !== item.sha256) errors.push(`${item.id}: sha256 mismatch`);
      if (!Number.isInteger(item.width) || !Number.isInteger(item.height) || !new RegExp(`viewBox="0 0 ${item.width} ${item.height}"`).test(text)) errors.push(`${item.id}: dimensions mismatch`);
    } catch { errors.push(`${item.id}: missing media`); }
  }
  for (const path of renderedPaths) if (!media.some((item) => item.path === path)) errors.push(`rendered image unregistered ${path}`);
  for (const item of media) if (!renderedPaths.includes(item.path)) errors.push(`orphan media ${item.id}`);
  return errors;
}
