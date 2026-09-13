const versions = ["ps2", "ps4"];
const list = (value) => (Array.isArray(value) ? value : []);
const object = (value) =>
  value && typeof value === "object" && !Array.isArray(value);
export function validate(data) {
  const errors = [];
  const fail = (path, message) => errors.push(`${path}: ${message}`);
  if (!object(data)) return ["data: expected object"];
  for (const key of ["sources", "entities", "actions", "stages"])
    if (!Array.isArray(data[key])) fail(key, "expected array");
  const maps = {};
  for (const key of ["sources", "entities", "actions", "stages"]) {
    maps[key] = new Map();
    for (const r of list(data[key])) {
      if (!object(r) || !/^[a-z][a-z0-9-]*$/.test(r.id)) {
        fail(key, "invalid record ID");
        continue;
      }
      if (maps[key].has(r.id)) fail(r.id, "duplicate ID");
      maps[key].set(r.id, r);
    }
  }
  const checkVersions = (r) => {
    if (
      !Array.isArray(r.versions) ||
      !r.versions.length ||
      r.versions.some((v) => !versions.includes(v))
    )
      fail(r.id, "invalid versions");
  };
  for (const s of maps.sources.values()) {
    checkVersions(s);
    if (typeof s.title !== "string" || !s.title) fail(s.id, "missing title");
    try {
      if (
        typeof s.url !== "string" ||
        !/^https:\/\/[^/@?#\\\s]+(?:[/?#]|$)/.test(s.url) ||
        /[\p{White_Space}\p{C}\\]/u.test(s.url) ||
        new URL(s.url).protocol !== "https:" ||
        new URL(s.url).username ||
        new URL(s.url).password
      )
        throw Error();
    } catch {
      fail(s.id, "unsafe source URL");
    }
  }
  const ref = (r, id, type) => {
    const target = maps[type].get(id);
    if (!target) fail(r.id, `unknown ${type} ID ${id}`);
    else if (
      type !== "sources" &&
      r.versions &&
      target.versions &&
      list(r.versions).some((v) => !list(target.versions).includes(v))
    )
      fail(r.id, `version leakage through ${id}`);
  };
  for (const stage of maps.stages.values()) {
    if (typeof stage.name !== "string" || !stage.name.trim())
      fail(stage.id, "missing name");
    if (stage.entityId !== undefined && stage.entityId !== null)
      ref(stage, stage.entityId, "entities");
  }
  for (const r of [...maps.entities.values(), ...maps.actions.values()]) {
    checkVersions(r);
    if (!["verified", "unknown", "conflicting"].includes(r.status))
      fail(r.id, "invalid status");
    for (const key of ["region", "confidence", "note"])
      if (typeof r[key] !== "string" || !r[key]) fail(r.id, `missing ${key}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.verifiedAt))
      fail(r.id, "invalid verification date");
    if (!Array.isArray(r.sourceIds) || !r.sourceIds.length)
      fail(r.id, "missing sources");
    for (const id of list(r.sourceIds)) ref(r, id, "sources");
    if (
      list(r.versions).some(
        (v) =>
          !list(r.sourceIds).some((id) =>
            list(maps.sources.get(id)?.versions).includes(v),
          ),
      )
    )
      fail(r.id, "source version coverage missing");
  }
  for (const e of maps.entities.values()) {
    if (
      typeof e.name !== "string" ||
      !e.name ||
      !Array.isArray(e.aliases) ||
      e.aliases.some((a) => typeof a !== "string")
    )
      fail(e.id, "malformed names");
    for (const k of ["en", "ja"])
      if (e[k] !== null && typeof e[k] !== "string")
        fail(e.id, `malformed ${k}`);
  }
  for (const a of maps.actions.values()) {
    if (typeof a.title !== "string" || !a.title.trim())
      fail(a.id, "missing title");
    for (const key of ["all", "any", "conflicts", "entityIds"]) {
      if (!Array.isArray(a[key])) fail(a.id, `malformed ${key}`);
      for (const id of list(a[key]))
        ref(a, id, key === "entityIds" ? "entities" : "actions");
    }
    for (const key of ["costs", "rewards"]) {
      if (!object(a[key])) fail(a.id, `malformed ${key}`);
      else
        for (const [id, n] of Object.entries(a[key])) {
          ref(a, id, "entities");
          if (!Number.isSafeInteger(n) || n <= 0)
            fail(a.id, "invalid quantity");
        }
    }
    if (!Number.isSafeInteger(a.sequence) || a.sequence < 0)
      fail(a.id, "invalid sequence");
    for (const key of ["start", "expire"])
      if (
        a[key] !== null &&
        (!Number.isInteger(a[key]) ||
          a[key] < 0 ||
          a[key] >= data.stages?.length)
      )
        fail(a.id, `invalid ${key}`);
    if (a.start !== null && a.expire !== null && a.start >= a.expire)
      fail(a.id, "invalid window");
    if (!["deterministic", "possible", "unknown"].includes(a.rewardType))
      fail(a.id, "invalid rewardType");
    for (const k of ["recipient", "companion"])
      if (a[k] !== null) ref(a, a[k], "entities");
    if (!["hard", "verification"].includes(a.windowKind))
      fail(a.id, "invalid windowKind");
    if (
      a.consumption !== undefined &&
      !["consumed", "returned"].includes(a.consumption)
    )
      fail(a.id, "invalid consumption");
    if (a.story !== undefined && typeof a.story !== "boolean")
      fail(a.id, "invalid story");
    if (
      a.recommendedBefore !== undefined &&
      a.recommendedBefore !== null &&
      (!Number.isInteger(a.recommendedBefore) ||
        a.recommendedBefore < 0 ||
        a.recommendedBefore >= data.stages?.length)
    )
      fail(a.id, "invalid recommendedBefore");
    if (a.elapsed !== undefined && a.elapsed !== null) {
      if (
        !object(a.elapsed) ||
        !Number.isFinite(a.elapsed.min) ||
        !Number.isFinite(a.elapsed.max) ||
        a.elapsed.min < 0 ||
        a.elapsed.max <= a.elapsed.min
      )
        fail(a.id, "invalid elapsed window");
      else ref(a, a.elapsed.item, "entities");
    }
    if (a.history !== undefined) {
      if (!Array.isArray(a.history)) fail(a.id, "invalid history");
      else for (const id of a.history) ref(a, id, "actions");
    }
    if (a.affinity !== null) {
      if (!object(a.affinity) || !Number.isFinite(a.affinity.min))
        fail(a.id, "invalid affinity");
      else ref(a, a.affinity.recipient, "entities");
    }
  }
  const visiting = new Set(),
    done = new Set();
  const visit = (id) => {
    if (visiting.has(id)) {
      fail(id, "prerequisite cycle");
      return;
    }
    if (done.has(id)) return;
    const a = maps.actions.get(id);
    if (!a) return;
    visiting.add(id);
    for (const dep of [...list(a.all), ...list(a.any)]) visit(dep);
    visiting.delete(id);
    done.add(id);
  };
  for (const id of maps.actions.keys()) visit(id);
  return errors;
}
