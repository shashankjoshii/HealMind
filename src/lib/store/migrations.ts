/**
 * Keyed by the persisted state's `version` at the time of migration — i.e.
 * `MIGRATIONS[1]` upgrades a v1 blob to v2. Empty today because this is the
 * first shipped version; add an entry here (not a rewrite of an existing
 * one) whenever PersistedState's shape changes.
 */
export const MIGRATIONS: Record<number, (persisted: unknown) => unknown> = {};

export function runMigrations(persisted: unknown, fromVersion: number): unknown {
  let state = persisted;
  let version = fromVersion;
  while (MIGRATIONS[version]) {
    state = MIGRATIONS[version](state);
    version += 1;
  }
  return state;
}
