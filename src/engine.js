// Pure rules; stage bounds are inclusive start, exclusive expiry.
export function evaluate(action, state) {
  let code = "ready";
  if (!action.versions.includes(state.version)) code = "version";
  else if (
    action.rewardType === "unknown" ||
    action.status !== "verified" ||
    action.start === null ||
    action.expire === null
  )
    code = "unknown";
  else if (state.events.includes(action.id)) code = "done";
  else if (state.stage >= action.expire)
    code = action.windowKind === "verification" ? "unknown" : "expired";
  else if (state.stage < action.start) code = "future";
  else if (action.conflicts.some((id) => state.events.includes(id)))
    code = "conflict";
  else if (
    !action.all.every((id) => state.events.includes(id)) ||
    (action.any.length && !action.any.some((id) => state.events.includes(id)))
  )
    code = "prerequisite";
  else if (
    Object.entries(action.costs).some(
      ([id, n]) => (state.inventory[id] ?? 0) < n,
    )
  )
    code = "inventory";
  else if (action.companion && !state.companions.includes(action.companion))
    code = "companion";
  else if (
    action.affinity &&
    !(state.affinity[action.affinity.recipient] >= action.affinity.min)
  )
    code = "affinity";
  if (code === "ready" && action.elapsed) {
    const acquired = state.acquiredAt?.[action.elapsed.item];
    if (!Number.isFinite(state.playMinutes) || !Number.isFinite(acquired))
      code = "unknown";
    else {
      const age = state.playMinutes - acquired;
      if (age < action.elapsed.min || age >= action.elapsed.max) code = "time";
    }
  }
  if (
    code === "ready" &&
    action.history?.length &&
    JSON.stringify(state.history?.slice(-action.history.length)) !==
      JSON.stringify(action.history)
  )
    code = "history";
  return { code };
}
export function applyAction(action, state) {
  const result = evaluate(action, state);
  if (result.code !== "ready") throw new Error(result.code);
  const next = structuredClone(state);
  if (action.consumption !== "returned")
    for (const [id, quantity] of Object.entries(action.costs))
      next.inventory[id] = (next.inventory[id] ?? 0) - quantity;
  if (action.rewardType === "deterministic")
    for (const [id, quantity] of Object.entries(action.rewards)) {
      next.inventory[id] = (next.inventory[id] ?? 0) + quantity;
      if (Number.isFinite(next.playMinutes)) {
        next.acquiredAt ??= {};
        next.acquiredAt[id] = next.playMinutes;
      }
    }
  next.events.push(action.id);
  next.history = [...(next.history ?? []), action.id];
  return next;
}
