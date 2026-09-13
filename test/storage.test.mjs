import test from "node:test";
import assert from "node:assert/strict";
const mod = await import("../src/progress.js").catch(() => ({}));
test("progress isolates versions and resets only the app version key; corrupt storage is safe", () => {
  assert.equal(typeof mod.createProgress, "function");
  const map = new Map([["other", "keep"]]);
  const storage = {
    getItem: (k) => map.get(k),
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
  };
  const p = mod.createProgress(storage);
  const s = p.load("ps4");
  s.stage = 1;
  p.save(s);
  assert.equal(p.load("ps2").stage, 0);
  assert.equal(p.load("ps4").stage, 1);
  p.reset("ps4");
  assert.equal(p.load("ps4").stage, 0);
  assert.equal(map.get("other"), "keep");
  storage.setItem("onimusha2-guide:v1:ps4", "bad");
  assert.equal(p.load("ps4").stage, 0);
  storage.setItem(
    "onimusha2-guide:v1:ps4",
    JSON.stringify({ version: "ps2", stage: 99 }),
  );
  assert.equal(p.load("ps4").stage, 0);
  assert.doesNotThrow(() =>
    mod
      .createProgress({
        getItem() {
          throw Error();
        },
        setItem() {
          throw Error();
        },
        removeItem() {
          throw Error();
        },
      })
      .save(s),
  );
});
