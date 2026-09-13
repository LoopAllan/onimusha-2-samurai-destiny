import test from "node:test";
import assert from "node:assert/strict";
import { walkthroughView } from "../src/walkthrough-model.js";

test("walkthrough projection filters and orders versions while preserving per-language evidence state", () => {
  const data = {
    sources: [
      {
        id: "ps2-source",
        title: "PS2 source",
        url: "https://example.com/ps2",
        versions: ["ps2"],
      },
      {
        id: "ps4-source",
        title: "PS4 source",
        url: "https://example.com/ps4",
        versions: ["ps4"],
      },
    ],
    entities: [
      {
        id: "yagyu-village",
        name: "柳生之庄",
        names: {
          "zh-TW": {
            ps4: { text: "柳生之庄", status: "editorial", sourceIds: [] },
          },
          en: {
            ps4: {
              text: "Yagyu Village",
              status: "verified",
              sourceIds: ["remaster-opening"],
            },
          },
          ja: {
            ps4: { text: null, status: "pending", sourceIds: [] },
          },
        },
      },
    ],
    walkthroughSteps: [
      {
        id: "later",
        sequence: 20,
        versions: ["ps4"],
        sourceIds: ["ps2-source", "ps4-source"],
        instructions: [
          {
            text: "Use the selected-version route evidence.",
            sourceIds: ["ps2-source", "ps4-source"],
          },
        ],
        entityIds: ["yagyu-village"],
      },
      {
        id: "ps2-only",
        sequence: 5,
        versions: ["ps2"],
        sourceIds: ["ps2-source"],
        entityIds: ["yagyu-village"],
      },
      {
        id: "earlier",
        sequence: 10,
        versions: ["ps4"],
        sourceIds: ["ps4-source"],
        instructions: [
          {
            text: "Use the selected-version route evidence.",
            sourceIds: ["ps2-source", "ps4-source"],
          },
        ],
        entityIds: ["yagyu-village"],
      },
    ],
  };

  const steps = walkthroughView(data, "ps4");
  assert.deepEqual(
    steps.map((step) => step.id),
    ["earlier", "later"],
  );
  assert.deepEqual(steps[0].sources, [data.sources[1]]);
  assert.deepEqual(steps[0].instructions[0].sources, [data.sources[1]]);
  assert.deepEqual(steps[0].entities[0].names, {
    zhTw: { text: "柳生之庄", status: "editorial", sourceIds: [] },
    en: { text: "Yagyu Village", status: "verified", sourceIds: ["remaster-opening"] },
    ja: { text: null, status: "pending", sourceIds: [] },
  });
});
