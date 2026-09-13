import test from "node:test";
import assert from "node:assert/strict";
import { entityHref, entityView, plainText } from "../src/entity-model.js";

test("rich entity segments project canonical text and stable companion anchors", () => {
  const entities = new Map([
    ["chalk", { id: "chalk", name: "白墨", en: "Chalk", ja: "白墨" }],
    ["heike", { id: "heike", name: "平家物語", en: "Tale of the Heike", ja: "平家物語" }],
  ]);
  assert.equal(entityHref("chalk"), "companions.html#entity-chalk");
  assert.equal(plainText([{ entityId: "chalk" }, { text: " → " }, { entityId: "heike" }], entities), "白墨 → 平家物語");
});

test("entity view selects version-specific name and acquisition without leaking PS2 cutoff", () => {
  const entity = {
    id: "melon", name: "哈密瓜", en: { ps2: "Melon", ps4: "Canteloupe" }, ja: "メロン",
    detail: { explanation: { text: "西班牙的綠色水果。", sourceIds: ["x"] }, thumbnailId: "thumb-melon",
      acquisition: [{ versions: ["ps2"], text: "PS2 取得。", actionIds: ["ps2-melon"], sourceIds: ["x"] }, { versions: ["ps4"], text: "Remaster 取得。", actionIds: ["ps4-melon"], sourceIds: ["y"] }],
      mapGuidance: [{ versions: ["ps4"], status: "available", text: "回到今庄道具店。", routeId: "imasho-shop", stopId: "rear-man", sourceIds: ["y"] }] }
  };
  const view = entityView({ entities: [entity], media: [{ id: "thumb-melon", path: "assets/items/melon.svg" }], actions: [] }, "melon", "ps4");
  assert.equal(view.en, "Canteloupe");
  assert.deepEqual(view.acquisition.map((x) => x.text), ["Remaster 取得。"]);
  assert.equal(view.mapGuidance[0].routeId, "imasho-shop");
});
