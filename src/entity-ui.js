import { entityHref, plainText } from "./entity-model.js";
const make = (document, tag, text, className) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; };
export function renderRichText(document, segments, entities) {
  const fragment = document.createDocumentFragment();
  for (const segment of segments ?? []) {
    if (segment.entityId) fragment.append(createEntityLink(document, entities.get(segment.entityId)));
    else fragment.append(document.createTextNode(segment.text ?? ""));
  }
  return fragment;
}
export function createEntityLink(document, entity) {
  const link = make(document, "a", entity.name, "entity-link");
  link.href = entityHref(entity.id); link.dataset.entity = entity.id;
  link.append(make(document, "small", `${entity.en ?? "EN 名稱待核"} / ${entity.ja ?? "JA 名稱待核"}`));
  link.append(make(document, "span", "查看道具詳情", "sr-only"));
  return link;
}
export function renderEntityDetail(document, view, data) {
  const article = make(document, "article", undefined, "entity-detail"); article.id = `entity-${view.id}`;
  const heading = make(document, "h3", view.name); heading.tabIndex = -1;
  article.append(heading, make(document, "p", `${view.en ?? "EN 名稱待核"} / ${view.ja ?? "JA 名稱待核"}`, "secondary-name"));
  if (view.thumbnail) { const image = document.createElement("img"); image.src = `./${view.thumbnail.path}`; image.alt = view.thumbnail.alt; image.width = view.thumbnail.width; image.height = view.thumbnail.height; article.append(image, make(document, "p", view.thumbnail.caption, "muted")); }
  const explanation = view.explanation ?? { text: "目前版本的道具說明待核。", sourceIds: [] };
  article.append(make(document, "p", explanation.text));
  const sourceIds = new Set(explanation.sourceIds);
  for (const item of view.acquisition) { article.append(make(document, "p", item.text)); for (const id of item.sourceIds) sourceIds.add(id); }
  const sources = data.sources.filter((source) => sourceIds.has(source.id) && source.versions.includes(view.version));
  if (sources.length) { const list = make(document, "p", "來源：", "muted"); for (const source of sources) { const link = make(document, "a", source.title); link.href = source.url; link.target = "_blank"; link.rel = "noopener noreferrer"; list.append(link, document.createTextNode("　")); } article.append(list); }
  for (const item of view.mapGuidance) {
    article.append(make(document, "p", item.text));
    if (item.routeId) { const route = data.routes.find((entry) => entry.id === item.routeId); const media = data.media.find((entry) => entry.id === route.mediaId); const image = document.createElement("img"); image.src = `./${media.path}`; image.alt = media.alt; image.width = media.width; image.height = media.height; article.append(image, make(document, "p", route.note, "muted")); }
  }
  return article;
}
export function installEntityPreview(document, getView) {
  const tip = make(document, "div", undefined, "entity-tooltip"); tip.id = "entity-tooltip"; tip.setAttribute("role", "tooltip"); tip.hidden = true; document.body.append(tip);
  let active = null, escaped = false;
  const close = () => { if (active) active.removeAttribute("aria-describedby"); active = null; tip.hidden = true; tip.replaceChildren(); };
  const open = (link) => { if (escaped) return; const view = getView(link.dataset.entity); if (!view) return; close(); active = link; link.setAttribute("aria-describedby", tip.id); const explanation = view.explanation ?? { text: "目前版本的道具說明待核。" }; tip.append(make(document, "strong", view.name), make(document, "p", `${view.en ?? "EN 名稱待核"} / ${view.ja ?? "JA 名稱待核"}`)); if (view.thumbnail) { const image = document.createElement("img"); image.src = `./${view.thumbnail.path}`; image.alt = view.thumbnail.alt; image.width = view.thumbnail.width; image.height = view.thumbnail.height; tip.append(image); } tip.append(make(document, "p", explanation.text), make(document, "p", view.acquisition?.[0]?.text ?? "取得資料待核。")); tip.hidden = false; const rect = link.getBoundingClientRect(); tip.style.left = `${Math.max(8, Math.min(innerWidth - 320, rect.left))}px`; tip.style.top = `${Math.max(8, Math.min(innerHeight - 180, rect.bottom + 8))}px`; };
  document.addEventListener("focusin", (event) => { if (event.target.matches?.("a.entity-link")) { escaped = false; open(event.target); } });
  document.addEventListener("pointerover", (event) => { if (matchMedia("(pointer: coarse)").matches) return; const link = event.target.closest?.("a.entity-link"); if (link) { escaped = false; open(link); } });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") { escaped = true; close(); } });
  document.addEventListener("focusout", () => setTimeout(() => { if (!tip.matches(":hover") && !document.activeElement?.matches("a.entity-link")) close(); }, 0));
  return { close, plainText };
}
