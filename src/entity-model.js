export const entityHref = (id) => `companions.html#entity-${id}`;

export function plainText(segments, entityIndex) {
  return (Array.isArray(segments) ? segments : [{ text: segments ?? "" }])
    .map((segment) =>
      typeof segment.text === "string"
        ? segment.text
        : entityIndex.get(segment.entityId)?.name ?? "",
    )
    .join("");
}

const versionValue = (value, version) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value[version] ?? null
    : value ?? null;

export function entityView(data, id, version) {
  const entity = data.entities.find((record) => record.id === id);
  if (!entity) return null;
  const detail = entity.detail ?? {};
  const explanation = Array.isArray(detail.explanation)
    ? detail.explanation.find((entry) => entry.versions?.includes(version)) ?? null
    : detail.explanation ?? null;
  return {
    ...entity,
    detail,
    explanation,
    version,
    en: versionValue(entity.en, version),
    ja: versionValue(entity.ja, version),
    href: entityHref(id),
    thumbnail: data.media?.find((media) => media.id === detail.thumbnailId) ?? null,
    acquisition: (detail.acquisition ?? []).filter((entry) =>
      entry.versions.includes(version),
    ),
    mapGuidance: (detail.mapGuidance ?? []).filter((entry) =>
      entry.versions.includes(version),
    ),
  };
}
