import { evaluate, applyAction } from "./engine.js";
import { select, itemRelations, guidance } from "./query.js";
import { validate } from "./validate.js";
import { createProgress, initialState } from "./progress.js";
const $ = (id) => document.getElementById(id);
const node = (tag, text, className) => {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  if (className) e.className = className;
  return e;
};
const statusLabels = {
  ready: "可依來源步驟操作",
  done: "已記錄完成",
  version: "不適用此版本",
  unknown: "條件／後續時間窗待核，不保證可完成",
  expired: "已超過硬性期限",
  future: "尚未到達階段",
  prerequisite: "先完成上游步驟",
  inventory: "缺少必要持有物",
  companion: "同伴條件未滿足",
  affinity: "羈絆條件未滿足",
  conflict: "已完成互斥操作",
  time: "遊玩時間不符",
  history: "連續操作條件不符",
};
async function start() {
  const response = await fetch(new URL("../data/guide.json", import.meta.url));
  if (!response.ok) throw Error("資料載入失敗");
  const data = await response.json();
  const errors = validate(data);
  if (errors.length) throw Error(errors.join("; "));
  let storage;
  try {
    storage = window.localStorage;
  } catch {
    storage = null;
  }
  const progress = createProgress(storage);
  let state = progress.load($("version").value);
  let selectedItem = null;
  const entities = new Map(data.entities.map((e) => [e.id, e]));
  const scoped = () =>
    data.actions.filter((a) => a.versions.includes(state.version));
  const secondary = (e) =>
    [e.en || "EN 名稱待核", e.ja || "JA 名稱待核"].join(" / ");
  function entityButton(id) {
    const e = entities.get(id);
    const b = node("button", e.name, "entity");
    b.type = "button";
    b.dataset.entity = id;
    b.append(node("small", secondary(e)));
    b.addEventListener("click", () => {
      selectedItem = id;
      renderDetail();
      $("item-detail").focus();
    });
    return b;
  }
  function sourceLinks(ids, parent) {
    for (const id of ids) {
      const s = data.sources.find((x) => x.id === id);
      if (!s.versions.includes(state.version)) continue;
      const a = node("a", s.title);
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      parent.append(a, document.createTextNode("　"));
    }
  }
  function renderDetail() {
    const box = $("item-detail");
    box.replaceChildren();
    if (!selectedItem) {
      box.append(node("p", "尚未選擇道具。"));
      return;
    }
    const e = entities.get(selectedItem);
    box.append(node("h3", e.name), node("small", secondary(e)));
    const related = itemRelations(scoped(), selectedItem);
    for (const [key, label] of [
      ["upstream", "上游取得"],
      ["downstream", "下游用途"],
    ]) {
      box.append(node("h4", label));
      const ul = node("ul");
      for (const id of related[key]) {
        const a = scoped().find((x) => x.id === id);
        ul.append(node("li", a.title));
      }
      if (!related[key].length)
        ul.append(node("li", "此切片尚未收錄，不代表遊戲中不存在。"));
      box.append(ul);
    }
    box.append(node("p", e.note));
    sourceLinks(e.sourceIds, box);
  }
  function render() {
    $("stage").value = String(state.stage);
    $("version-badge").textContent =
      state.version === "ps4" ? "PS4 Remaster" : "PS2 原版";
    const stageFilter = $("stage-filter").value;
    const results = select(data.actions, data.entities, {
      version: state.version,
      stage: stageFilter === "" ? undefined : Number(stageFilter),
      recipient: $("recipient").value,
      q: $("search").value,
      spoilers: $("spoilers").checked,
    });
    $("result-count").textContent = `${results.length} 個步驟 · 依交換順序排列`;
    $("chain").replaceChildren();
    for (const a of results) {
      const card = node("article", undefined, "step");
      card.id = a.id;
      const title = node("h3");
      title.append(
        node("span", String(a.sequence).padStart(2, "0"), "number"),
        node("span", a.title),
      );
      card.append(
        title,
        node("p", statusLabels[evaluate(a, state).code], "state"),
        node("p", a.note),
      );
      const tags = node("div", undefined, "entity-buttons");
      for (const id of a.entityIds) tags.append(entityButton(id));
      card.append(tags);
      const windowText =
        a.start === null || a.expire === null
          ? "時間窗待查證，不保證目前可完成。"
          : a.windowKind === "hard"
            ? `硬性期限：${data.stages[a.expire].name}之前`
            : `僅確認此路線在「${data.stages[a.start].name}」的操作；之後未判定為可完成。`;
      card.append(
        node("p", windowText, "meta"),
        node(
          "p",
          `回禮：${a.rewardType === "deterministic" ? "來源記載固定回禮" : "可能回禮，不自動加入持有物"} · ${state.version.toUpperCase()} · ${a.verifiedAt} · 未實機驗證`,
          "meta",
        ),
      );
      const citations = node("p", undefined, "meta");
      sourceLinks(a.sourceIds, citations);
      card.append(citations);
      const complete = node("button", "已在遊戲完成，記入筆記");
      complete.dataset.complete = a.id;
      complete.disabled = evaluate(a, state).code !== "ready";
      complete.addEventListener("click", () => {
        state = applyAction(a, state);
        persist();
        render();
      });
      card.append(complete);
      $("chain").append(card);
    }
    if (!results.length)
      $("chain").append(
        node("p", "沒有符合條件的步驟。請清除搜尋或調整篩選。"),
      );
    const lists = guidance(scoped(), state);
    for (const [id, items] of [
      ["now", lists.now],
      ["before", lists.before],
    ]) {
      const ul = $(id);
      ul.replaceChildren();
      for (const a of items)
        ul.append(
          node(
            "li",
            a.title +
              (id === "before" && a.windowKind === "verification"
                ? "（建議先完成，非通用硬期限）"
                : ""),
          ),
        );
      if (!items.length)
        ul.append(
          node(
            "li",
            id === "now"
              ? "目前沒有可判定的步驟；檢查階段、持有物及上游。"
              : "此切片沒有新的期限提醒；不代表其他收集沒有風險。",
          ),
        );
    }
    $("inventory").replaceChildren();
    for (const e of data.entities.filter(
      (e) =>
        e.kind === "item" &&
        ["chalk", "heike", "emblem", "melon", "necklace"].includes(e.id),
    )) {
      const b = entityButton(e.id);
      b.append(document.createTextNode(`持有 ${state.inventory[e.id] ?? 0}`));
      $("inventory").append(b);
    }
    $("version-note").textContent =
      state.version === "ps4"
        ? "PS4 Remaster：紫魂達條件後，可選擇鬼武者變身時機；新增自動存檔、免開選單切換武器，簡單難度起始可選。修羅（Hell / 修羅）受到一擊即死亡。這些改動不證明所有 PS2 交換細節都相同。"
        : "PS2 原版：CAPCOM 的新舊版對照說明，吸收第五個紫魂會自動變身。不要沿用 Remaster 的手動發動、自動存檔或新增難度說明。";
    $("sources").replaceChildren();
    sourceLinks(
      data.sources
        .filter((s) => s.versions.includes(state.version))
        .map((s) => s.id),
      $("sources"),
    );
    renderDetail();
  }
  function persist() {
    $("storage-status").textContent = progress.save(state)
      ? "已儲存於此瀏覽器，僅適用目前版本。"
      : "瀏覽器無法儲存；目前只保留於本頁，重新整理會遺失。";
  }
  for (const [i, stage] of data.stages.entries()) {
    for (const id of ["stage", "stage-filter"]) {
      const option = node("option", stage.name);
      option.value = String(i);
      $(id).append(option);
    }
  }
  for (const id of [...new Set(data.actions.map((a) => a.recipient))]) {
    if (id === null) continue;
    const e = entities.get(id);
    const option = node("option", e.name + " / " + secondary(e));
    option.value = id;
    $("recipient").append(option);
  }
  for (const e of data.entities.filter((e) => e.kind === "character")) {
    const p = node("p", e.name);
    p.append(node("small", secondary(e)));
    $("characters").append(p);
  }
  $("version").addEventListener("change", () => {
    state = progress.load($("version").value);
    $("stage-filter").value = "";
    render();
    $("storage-status").textContent = "已切換獨立版本筆記。";
  });
  $("apply-stage").addEventListener("click", () => {
    const next = Number($("stage").value);
    if (next < state.stage) {
      $("stage").value = String(state.stage);
      $("storage-status").textContent =
        "不可倒退事件以重新取得道具；若是新一輪請重設此版本筆記。";
      return;
    }
    const warnings = guidance(scoped(), state, next).before;
    if (
      next > state.stage &&
      warnings.length &&
      !window.confirm(
        "推進可能錯過尚未完成的路線。請先確認「前進前確認」；確定在遊戲已前進？",
      )
    ) {
      $("stage").value = String(state.stage);
      return;
    }
    state.stage = next;
    persist();
    render();
  });
  $("reset").addEventListener("click", () => {
    if (
      !window.confirm(
        "只重設目前版本的本機攻略筆記？不影響遊戲存檔或其他網站。",
      )
    )
      return;
    const ok = progress.reset(state.version);
    state = initialState(state.version);
    $("storage-status").textContent = ok
      ? "已重設目前版本筆記。"
      : "無法清除儲存；本頁已重設，重新整理可能還原舊筆記。";
    render();
  });
  for (const id of ["search", "stage-filter", "recipient", "spoilers"])
    $(id).addEventListener(id === "search" ? "input" : "change", render);
  render();
}
start().catch((error) => {
  $("storage-status").textContent =
    `無法啟動：${error.message}。請透過 HTTP 伺服器開啟（file:// 不支援）；重新載入再試。`;
});
