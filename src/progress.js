const key = (version) => `onimusha2-guide:v1:${version}`;
export const initialState = (version) => ({
  version,
  stage: 0,
  events: [],
  inventory: {},
  companions: [],
  affinity: {},
  history: [],
  playMinutes: 0,
  acquiredAt: {},
});
export function createProgress(storage) {
  return {
    load(version) {
      try {
        const s = JSON.parse(storage.getItem(key(version)));
        if (
          s?.version === version &&
          Number.isInteger(s.stage) &&
          s.stage >= 0 &&
          s.stage <= 3 &&
          Array.isArray(s.events) &&
          Array.isArray(s.companions) &&
          s.inventory &&
          Object.values(s.inventory).every(
            (n) => Number.isSafeInteger(n) && n >= 0,
          ) &&
          s.affinity &&
          Array.isArray(s.history)
        )
          return s;
      } catch {
        /* Storage may be unavailable or corrupt. */
      }
      return initialState(version);
    },
    save(state) {
      try {
        storage.setItem(key(state.version), JSON.stringify(state));
        return true;
      } catch {
        return false;
      }
    },
    reset(version) {
      try {
        storage.removeItem(key(version));
        return true;
      } catch {
        return false;
      }
    },
  };
}
