const languageKeys = {
  zhTw: "zh-TW",
  en: "en",
  ja: "ja",
};

function nameRecord(entity, language, version) {
  const record = entity.names?.[language]?.[version];
  if (record)
    return {
      text: record.text ?? null,
      status: record.status,
      sourceIds: [...(record.sourceIds ?? [])],
    };

  if (language === "zh-TW") {
    return { text: entity.name ?? null, status: "editorial", sourceIds: [] };
  }
  const legacy = entity[language];
  const text = legacy && typeof legacy === "object" ? legacy[version] : legacy;
  return {
    text: text || null,
    status: text ? "source-listed" : "pending",
    sourceIds: text ? [...(entity.sourceIds ?? [])] : [],
  };
}

export function entityNameView(entity, version) {
  return {
    id: entity.id,
    names: Object.fromEntries(
      Object.entries(languageKeys).map(([output, language]) => [
        output,
        nameRecord(entity, language, version),
      ]),
    ),
  };
}

export function walkthroughView(data, version) {
  const entities = new Map(data.entities.map((entity) => [entity.id, entity]));
  const sources = new Map(data.sources.map((source) => [source.id, source]));
  const versionSources = (sourceIds) =>
    sourceIds
      .map((id) => sources.get(id))
      .filter((source) => source?.versions.includes(version));

  return data.walkthroughSteps
    .filter((step) => step.versions.includes(version))
    .sort((left, right) => left.sequence - right.sequence || left.id.localeCompare(right.id))
    .map((step) => ({
      ...step,
      entities: step.entityIds.map((id) => entityNameView(entities.get(id), version)),
      instructions: (step.instructions ?? []).map((instruction) => ({
        ...instruction,
        sources: versionSources(instruction.sourceIds),
      })),
      sources: versionSources(step.sourceIds),
    }));
}
