import { MOOD_BY_KEY } from "@/lib/mock-data";
import type { JournalEntry, MoodEntry, PathKey } from "@/lib/types";
import type { AppState, StoredMoodEntry } from "./types";

/**
 * zustand v5 + useSyncExternalStore: a selector passed straight to
 * `useAppStore(selector)` must return a referentially stable value when the
 * underlying data hasn't changed — one that allocates a new object/array on
 * every call (map, sort, spread) causes "Maximum update depth exceeded" /
 * "getServerSnapshot should be cached" the moment it's used, not just an
 * extra render. Confirmed live while wiring /mood: `useAppStore(selectMoodHistory)`
 * as a single derived-array selector infinite-looped.
 *
 * So this file only exports two kinds of things:
 *  - raw-slice selectors (selectMoodEntries, selectProgramme, selectStreak)
 *    that return a value already stable in the store (a primitive, or an
 *    object reference the relevant slice only replaces on real mutation) —
 *    safe to pass directly to useAppStore().
 *  - pure derive* functions that transform such a raw slice — call these
 *    inside the component's own useMemo, keyed on the raw slice, e.g.:
 *      const moodEntries = useAppStore(selectMoodEntries);
 *      const history = useMemo(() => deriveMoodHistory(moodEntries), [moodEntries]);
 */

function stripSeeded(entry: StoredMoodEntry): MoodEntry {
  const rest: Partial<StoredMoodEntry> = { ...entry };
  delete rest.seeded;
  return rest as MoodEntry;
}

export function selectMoodEntries(state: AppState) {
  return state.moodEntries;
}

export function deriveMoodHistory(
  moodEntries: AppState["moodEntries"],
): MoodEntry[] {
  return Object.values(moodEntries)
    .map(stripSeeded)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function deriveTodayEntry(
  moodEntries: AppState["moodEntries"],
  todayKey: string,
): MoodEntry | undefined {
  const entry = moodEntries[todayKey];
  return entry ? stripSeeded(entry) : undefined;
}

export function selectJournalEntries(state: AppState) {
  return state.journalEntries;
}

export function deriveJournalEntries(
  journalEntries: AppState["journalEntries"],
): JournalEntry[] {
  return Object.values(journalEntries).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

/**
 * Average mood score (1-7) over a window of entries, or null if there's
 * nothing to average. Stands in for the old `UserProfile.wellbeingScore`
 * field, which was never given a real formula and was dropped from
 * `ProfileSlice` for exactly that reason. Phase 5's src/lib/insights.ts
 * owns the real composite (mood + consistency + self-report); this is an
 * honest, simple interim used by /dashboard and /analytics until then.
 */
export function averageMoodScore(entries: Pick<MoodEntry, "mood">[]): number | null {
  if (entries.length === 0) return null;
  const sum = entries.reduce((acc, e) => acc + MOOD_BY_KEY[e.mood].score, 0);
  return sum / entries.length;
}

export function selectStreak(state: AppState): number {
  return state.profile.streak;
}

export function selectProgramme(path: PathKey) {
  return (state: AppState) => state.programmes[path];
}
