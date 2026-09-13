const versions = ["ps2", "ps4"];
const list = (value) => (Array.isArray(value) ? value : []);
const object = (value) =>
  value && typeof value === "object" && !Array.isArray(value);
export function validate(data) {
  const errors = [];
  const fail = (path, message) => errors.push(`${path}: ${message}`);
  if (!object(data)) return ["data: expected object"];
  for (const key of ["sources", "entities", "actions", "stages", "walkthroughSteps"])
    if (!Array.isArray(data[key])) fail(key, "expected array");
  for (const key of ["media", "routes"])
    if (data[key] !== undefined && !Array.isArray(data[key])) fail(key, "expected array");
  const maps = {};
  for (const key of ["sources", "entities", "actions", "stages", "media", "routes"]) {
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
  const walkthroughSourceIds = new Set(
    list(data.walkthroughSteps).flatMap((step) => list(step?.sourceIds)),
  );
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
    if (walkthroughSourceIds.has(s.id)) {
      for (const key of ["sourceType", "region", "support"])
        if (typeof s[key] !== "string" || !s[key].trim())
          fail(s.id, `missing ${key}`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s.accessedAt))
        fail(s.id, "missing accessedAt");
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
      if (
        e[k] !== null &&
        typeof e[k] !== "string" &&
        (!object(e[k]) || Object.values(e[k]).some((v) => typeof v !== "string"))
      )
        fail(e.id, `malformed ${k}`);
    if (e.names !== undefined) {
      if (!object(e.names)) fail(e.id, "invalid name evidence");
      else
        for (const language of ["zh-TW", "en", "ja"]) {
          const scopedNames = e.names[language];
          if (!object(scopedNames)) {
            fail(e.id, `missing ${language} name evidence`);
            continue;
          }
          for (const version of e.versions) {
            const record = scopedNames[version];
            if (!object(record)) {
              fail(e.id, `missing ${language} ${version} name evidence`);
              continue;
            }
            if (!["in-game-verified", "source-listed", "editorial", "pending", "conflicting"].includes(record.status))
              fail(e.id, "invalid name evidence status");
            if (!Array.isArray(record.sourceIds))
              fail(e.id, "invalid name evidence sources");
            const hasText = typeof record.text === "string" && record.text.trim();
            if (record.status === "pending") {
              if (record.text !== null || list(record.sourceIds).length)
                fail(e.id, "pending name must not cite sources");
            } else if (record.status === "conflicting") {
              if (record.text !== null || list(record.sourceIds).length < 2)
                fail(e.id, "conflicting name requires two sources and no selected text");
            } else if (!hasText) fail(e.id, "name evidence text missing");
            const sourcedName = ["in-game-verified", "source-listed", "conflicting"].includes(record.status);
            if (sourcedName && !list(record.sourceIds).length)
              fail(e.id, "sourced name missing sources");
            for (const sourceId of list(record.sourceIds)) {
              ref({ ...e, versions: [version] }, sourceId, "sources");
              if (!list(e.sourceIds).includes(sourceId))
                fail(e.id, "name evidence source missing from entity sourceIds");
            }
            if (
              sourcedName &&
              !list(record.sourceIds).some((sourceId) =>
                list(maps.sources.get(sourceId)?.versions).includes(version),
              )
            )
              fail(e.id, "name source version coverage missing");
          }
        }
    }
    if (["chalk", "heike", "emblem", "melon", "necklace"].includes(e.id) && e.detail === undefined)
      fail(e.id, "missing illustrated detail");
    if (e.detail !== undefined) {
      if (!object(e.detail) || !maps.media.has(e.detail.thumbnailId)) fail(e.id, "invalid detail thumbnail");
      const textRecord = (record) => object(record) && typeof record.text === "string" && Array.isArray(record.sourceIds) && record.sourceIds.length;
      const versionedTextRecord = (record) => textRecord(record) && Array.isArray(record.versions) && record.versions.length && record.versions.every((version) => versions.includes(version));
      const detailTextRecords = Array.isArray(e.detail.explanation) ? e.detail.explanation : [e.detail.explanation];
      if (!detailTextRecords.length || detailTextRecords.some((entry) => !textRecord(entry))) fail(e.id, "invalid detail explanation");
      const covered = new Set();
      for (const entry of detailTextRecords) {
        const entryVersions = entry.versions ?? e.versions;
        if (entry.versions !== undefined && !versionedTextRecord(entry)) fail(e.id, "invalid explanation versions");
        for (const sourceId of list(entry.sourceIds)) ref({ ...e, versions: entryVersions }, sourceId, "sources");
        for (const version of entryVersions) {
          covered.add(version);
          if (!list(entry.sourceIds).some((id) => list(maps.sources.get(id)?.versions).includes(version))) fail(e.id, "source version coverage missing");
        }
      }
      if (list(e.versions).some((version) => !covered.has(version))) fail(e.id, "explanation version coverage missing");
      for (const entry of [...list(e.detail.acquisition), ...list(e.detail.mapGuidance)]) {
        if (!versionedTextRecord(entry)) fail(e.id, "invalid detail entry");
        for (const sourceId of list(entry.sourceIds)) ref({ ...e, versions: entry.versions }, sourceId, "sources");
        for (const version of list(entry.versions)) if (!list(entry.sourceIds).some((id) => list(maps.sources.get(id)?.versions).includes(version))) fail(e.id, "source version coverage missing");
        if (entry.status === "available") { if (!maps.routes.has(entry.routeId)) fail(e.id, "unknown route"); }
        else if (entry.status !== undefined && entry.status !== "not-established") fail(e.id, "invalid map status");
      }
    }
  }
  const seenWalkthroughIds = new Set();
  for (const step of list(data.walkthroughSteps)) {
    if (!object(step) || !/^[a-z][a-z0-9-]*$/.test(step.id)) {
      fail("walkthroughSteps", "invalid record ID");
      continue;
    }
    if (seenWalkthroughIds.has(step.id))
      fail(step.id, "duplicate walkthrough ID");
    seenWalkthroughIds.add(step.id);
    checkVersions(step);
    if (!Number.isSafeInteger(step.sequence) || step.sequence < 0)
      fail(step.id, "invalid sequence");
    for (const key of ["region", "confidence"])
      if (typeof step[key] !== "string" || !step[key].trim())
        fail(step.id, `missing ${key}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(step.verifiedAt))
      fail(step.id, "invalid verification date");
    if (!["required", "optional", "boundary"].includes(step.kind))
      fail(step.id, "invalid walkthrough kind");
    if (
      ![
        "source-checked",
        "cross-checked",
        "in-game-verified",
        "pending",
        "conflicting",
      ].includes(step.status)
    )
      fail(step.id, "invalid walkthrough status");
    if (typeof step.title !== "string" || !step.title.trim())
      fail(step.id, "missing title");
    if (typeof step.summary !== "string" || !step.summary.trim())
      fail(step.id, "missing summary");
    if (!Array.isArray(step.entityIds) || !step.entityIds.length)
      fail(step.id, "malformed entityIds");
    if (!Array.isArray(step.instructions) || !step.instructions.length)
      fail(step.id, "missing instructions");
    else
      for (const instruction of step.instructions) {
        if (!object(instruction) || typeof instruction.text !== "string" || !instruction.text.trim())
          fail(step.id, "invalid instruction text");
        if (!Array.isArray(instruction?.sourceIds) || !instruction.sourceIds.length)
          fail(step.id, "instruction missing sources");
        for (const sourceId of list(instruction?.sourceIds)) {
          ref(step, sourceId, "sources");
          if (!list(step.sourceIds).includes(sourceId))
            fail(step.id, "instruction source missing from step sources");
        }
        for (const version of list(step.versions))
          if (
            !list(instruction?.sourceIds).some((sourceId) =>
              list(maps.sources.get(sourceId)?.versions).includes(version),
            )
          )
            fail(step.id, "instruction source version coverage missing");
      }
    if (typeof step.missable !== "boolean") fail(step.id, "invalid missable");
    if (typeof step.irreversible !== "boolean")
      fail(step.id, "invalid irreversible");
    if (typeof step.leavesArea !== "boolean")
      fail(step.id, "invalid leavesArea");
    if (!Array.isArray(step.sourceIds) || !step.sourceIds.length)
      fail(step.id, "missing sources");
    for (const id of list(step.sourceIds)) ref(step, id, "sources");
    for (const version of list(step.versions))
      if (
        !list(step.sourceIds).some((sourceId) =>
          list(maps.sources.get(sourceId)?.versions).includes(version),
        )
      )
        fail(step.id, "source version coverage missing");
    for (const id of list(step.entityIds)) ref(step, id, "entities");
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
