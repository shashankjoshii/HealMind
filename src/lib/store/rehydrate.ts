import { daysBetween, todayKey, toDateKey } from "@/lib/utils";
import type { AppState } from "./types";

function shiftDateKey(dateKey: string, deltaDays: number) {
  if (deltaDays === 0) return dateKey;
  const d = new Date(`${dateKey}T12:00:00`);
  d.setDate(d.getDate() + deltaDays);
  return toDateKey(d);
}

function shiftIsoDate(iso: string, deltaDays: number) {
  if (deltaDays === 0) return iso;
  const d = new Date(iso);
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString();
}

/**
 * Slides untouched demo content forward from `state.demoAnchor` (the last
 * calendar date it was anchored to — either DEMO_ANCHOR itself on a brand
 * new store, or "today" as of the last time this ran) onto real "today", so
 * the sample data always looks current no matter when someone opens the
 * app. Crucially this shifts relative to `demoAnchor`, NOT the fixed
 * DEMO_ANCHOR constant in seed.ts — shifting from the fixed constant every
 * session would double-apply the offset each time the app is reopened on a
 * new day, since the previous session's shift was already persisted. A
 * no-op once `demoMode` is false, i.e. once real user data exists.
 */
export function reanchorDemoDates(state: AppState): Partial<AppState> {
  if (!state.demoMode) return {};

  const today = todayKey();
  const deltaDays = daysBetween(state.demoAnchor, today);
  if (deltaDays === 0) return {};

  const moodEntries = Object.fromEntries(
    Object.entries(state.moodEntries).map(([, entry]) => {
      const date = shiftDateKey(entry.date, deltaDays);
      return [date, { ...entry, date }];
    }),
  );

  const journalEntries = Object.fromEntries(
    Object.entries(state.journalEntries).map(([id, entry]) => [
      id,
      { ...entry, createdAt: shiftIsoDate(entry.createdAt, deltaDays) },
    ]),
  );

  const programmes = Object.fromEntries(
    Object.entries(state.programmes).map(([key, programme]) => [
      key,
      programme && {
        ...programme,
        startedOn: shiftDateKey(programme.startedOn, deltaDays),
        completedDates: programme.completedDates.map((d) => shiftDateKey(d, deltaDays)),
      },
    ]),
  ) as AppState["programmes"];

  return {
    moodEntries,
    journalEntries,
    programmes,
    profile: { ...state.profile, joinedOn: shiftDateKey(state.profile.joinedOn, deltaDays) },
    demoAnchor: today,
  };
}

/**
 * A real user's persisted streak can go stale simply by closing the app for
 * a few days — recompute it from the most recent completedDate across every
 * enrolled programme rather than trusting the number that was last saved.
 */
export function recomputeStreak(state: AppState): Partial<AppState> {
  const lastDates = Object.values(state.programmes)
    .flatMap((p) => p?.completedDates ?? [])
    .sort();
  const lastDate = lastDates[lastDates.length - 1];
  if (!lastDate) return {};

  const gap = daysBetween(lastDate, todayKey());
  if (gap <= 1) return {};

  return { profile: { ...state.profile, streak: 0 } };
}
