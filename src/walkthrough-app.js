import { walkthroughView } from "./walkthrough-model.js";

const root = document.querySelector("#walkthrough-root");
const sourceRoot = document.querySelector("#walkthrough-sources");
const versionSelect = document.querySelector("#version");

const statusLabels = {
  "in-game-verified": "實機畫面核對",
  "source-listed": "來源列名",
  editorial: "本站暫譯",
  pending: "待核",
  conflicting: "來源衝突",
};

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function badge(text, className = "") {
  return element("span", `badge ${className}`.trim(), text);
}

function renderNameLine(label, record) {
  const line = element("small", "walkthrough-name-line");
  const text = record.text ?? (record.status === "conflicting" ? "名稱來源衝突" : "名稱待核");
  line.append(`${label} ${text}`);
  line.append(badge(statusLabels[record.status] ?? record.status, `name-${record.status}`));
  return line;
}

function renderEntity(entity) {
  const card = element("li", "walkthrough-entity");
  const heading = element("strong", "walkthrough-entity-primary", entity.names.zhTw.text ?? entity.name);
  heading.append(badge(statusLabels[entity.names.zhTw.status], `name-${entity.names.zhTw.status}`));
  card.append(heading, renderNameLine("EN", entity.names.en), renderNameLine("日文", entity.names.ja));
  return card;
}

function appendSources(node, sources) {
  for (const [citationIndex, source] of sources.entries()) {
    if (citationIndex) node.append("、");
    const link = element("a", "", source.title);
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    node.append(link);
  }
}

function renderStep(step, index) {
  const article = element("article", "walkthrough-step panel");
  article.id = step.id;
  article.dataset.sequence = String(step.sequence);

  const header = element("div", "walkthrough-step-header");
  const title = element("h2", "", `${String(index + 1).padStart(2, "0")}　${step.title}`);
  const badges = element("div", "status-row");
  badges.append(badge(step.kind === "required" ? "必要流程" : step.kind === "boundary" ? "區域終點" : "建議收集"));
  badges.append(badge("來源核對", "verified"));
  if (step.missable) badges.append(badge("離區前檢查", "warning"));
  if (step.leavesArea) badges.append(badge("離開目前區域", "warning"));
  if (step.irreversible) badges.append(badge("不可逆推進", "danger"));
  header.append(title, badges);

  const summary = element("p", "walkthrough-summary", step.summary);
  const instructions = element("ol", "walkthrough-instructions");
  for (const record of step.instructions) {
    const item = element("li", "", record.text);
    const citations = element("small", "citation-line");
    citations.append("來源：");
    appendSources(citations, record.sources);
    item.append(" ", citations);
    instructions.append(item);
  }

  const namesHeading = element("h3", "", "本步驟名稱核對");
  const entities = element("ul", "walkthrough-entities");
  for (const entity of step.entities) entities.append(renderEntity(entity));

  const citations = element("p", "citation-line");
  citations.append("本步驟來源：");
  appendSources(citations, step.sources);
  article.append(header, summary, instructions, namesHeading, entities, citations);
  return article;
}

function renderSources(data, steps) {
  const ids = new Set(
    steps.flatMap((step) => [
      ...step.sources.map((source) => source.id),
      ...step.instructions.flatMap((instruction) =>
        instruction.sources.map((source) => source.id),
      ),
      ...step.entities.flatMap((entity) =>
        Object.values(entity.names).flatMap((record) => record.sourceIds ?? []),
      ),
    ]),
  );
  const list = element("ul", "source-list");
  for (const source of data.sources.filter((record) => ids.has(record.id))) {
    const item = element("li", "source-record");
    const link = element("a", "", source.title);
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    const metadata = element("small", "", `${source.sourceType} · ${source.region} · 查閱 ${source.accessedAt}`);
    const support = element("p", "", source.support);
    item.append(link, metadata, support);
    list.append(item);
  }
  sourceRoot.replaceChildren(list);
}

function render(data) {
  const steps = walkthroughView(data, versionSelect.value);
  const fragment = document.createDocumentFragment();
  for (const [index, step] of steps.entries()) fragment.append(renderStep(step, index));
  root.replaceChildren(fragment);
  renderSources(data, steps);
}

try {
  const response = await fetch("./data/guide.json");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  render(data);
  versionSelect.addEventListener("change", () => render(data));
} catch (error) {
  root.textContent = `流程資料載入失敗：${error.message}`;
  sourceRoot.textContent = "來源目錄目前無法載入。";
}
