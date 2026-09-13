import { evaluate } from "./engine.js";
export function select(
  records,
  entities,
  { version, stage, recipient, q = "", spoilers = false },
) {
  const needle = q.trim().toLocaleLowerCase();
  return records
    .filter(
      (record) =>
        record.versions.includes(version) &&
        (!record.story || spoilers) &&
        (stage === undefined ||
          (record.start <= stage &&
            (record.expire === null || stage < record.expire))) &&
        (!recipient || record.recipient === recipient) &&
        [
          record.title,
          ...record.entityIds.flatMap((id) => {
            const e = entities.find((x) => x.id === id);
            return e ? [e.name, e.en, e.ja, ...e.aliases] : [];
          }),
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase()
          .includes(needle),
    )
    .sort((a, b) => a.sequence - b.sequence || a.id.localeCompare(b.id));
}

export function itemRelations(records, id) {
  return {
    upstream: records.filter((a) => a.rewards[id]).map((a) => a.id),
    downstream: records.filter((a) => a.costs[id]).map((a) => a.id),
  };
}
export function guidance(records, state, nextStage = state.stage + 1) {
  const pending = records.filter(
    (a) => a.versions.includes(state.version) && !state.events.includes(a.id),
  );
  return {
    now: pending.filter((a) => evaluate(a, state).code === "ready"),
    before: pending.filter((a) =>
      [a.expire, a.recommendedBefore].some(
        (checkpoint) =>
          Number.isInteger(checkpoint) &&
          checkpoint > state.stage &&
          checkpoint <= nextStage,
      ),
    ),
  };
}
