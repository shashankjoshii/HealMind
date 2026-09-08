import { ACHIEVEMENTS, JOURNAL_ENTRIES, MOOD_HISTORY } from "@/lib/mock-data";
import type { PathKey } from "@/lib/types";
import { toDateKey } from "@/lib/utils";
import type {
  ProfileSlice,
  ProgrammeState,
  StoredJournalEntry,
  StoredMoodEntry,
} from "./types";

/**
 * Fixed point in time the demo content is authored against — matches the
 * anchor already baked into mock-data.ts's generateMoodHistory(). Using a
 * fixed anchor (not `new Date()`) for the state that seeds both the server
 * render and the first client render is what keeps them byte-identical;
 * see the hydration risk note in plan.md. Real "today" is applied afterwards
 * by reanchorDemoDates(), run once from onRehydrateStorage.
 */
export const DEMO_ANCHOR = new Date("2026-08-03T12:00:00");

function daysBeforeKey(anchor: Date, daysAgo: number) {
  const d = new Date(anchor);
  d.setDate(d.getDate() - daysAgo);
  return toDateKey(d);
}

function contiguousDates(anchor: Date, count: number, endOffsetDays: number) {
  // The `count` calendar dates ending `endOffsetDays` before `anchor`, most recent last.
  const dates: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    dates.push(daysBeforeKey(anchor, endOffsetDays + i));
  }
  return dates;
}

function buildProgramme(
  anchor: Date,
  path: ProgrammeState["path"],
  currentDay: number,
  skippedDays: number[],
): ProgrammeState {
  const completedDays = Array.from({ length: currentDay - 1 }, (_, i) => i + 1).filter(
    (d) => !skippedDays.includes(d),
  );
  const completedDates = contiguousDates(anchor, completedDays.length, 1);
  return {
    path,
    startedOn: daysBeforeKey(anchor, currentDay),
    currentDay,
    completedDays,
    completedDates,
  };
}

function seedMoodEntries(anchor: Date): Record<string, StoredMoodEntry> {
  const anchorDelta = Math.round((anchor.getTime() - DEMO_ANCHOR.getTime()) / 86_400_000);
  const entries: Record<string, StoredMoodEntry> = {};
  for (const entry of MOOD_HISTORY) {
    const shifted = anchorDelta === 0 ? entry.date : shiftDateKey(entry.date, anchorDelta);
    entries[shifted] = { ...entry, date: shifted, seeded: true };
  }
  return entries;
}

function seedJournalEntries(anchor: Date): Record<string, StoredJournalEntry> {
  const anchorDelta = Math.round((anchor.getTime() - DEMO_ANCHOR.getTime()) / 86_400_000);
  const entries: Record<string, StoredJournalEntry> = {};
  for (const entry of JOURNAL_ENTRIES) {
    const createdAt =
      anchorDelta === 0 ? entry.createdAt : shiftIsoDate(entry.createdAt, anchorDelta);
    entries[entry.id] = { ...entry, createdAt, seeded: true };
  }
  return entries;
}

function shiftDateKey(dateKey: string, deltaDays: number) {
  const d = new Date(`${dateKey}T12:00:00`);
  d.setDate(d.getDate() + deltaDays);
  return toDateKey(d);
}

function shiftIsoDate(iso: string, deltaDays: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString();
}

/**
 * The demo/sample state a first-time visitor sees. Deterministic and
 * generated (never literal dates baked in beyond DEMO_ANCHOR itself), so
 * server HTML and the first client render agree, and so reanchorDemoDates()
 * can slide the whole thing onto real "today" after hydration without
 * touching any of the relative shape (streaks, gaps, phase boundaries).
 */
export function buildDemoState(anchor: Date = DEMO_ANCHOR) {
  const anxiety = buildProgramme(anchor, "anxiety", 26, [7, 16, 17]);
  const sleep = buildProgramme(anchor, "sleep", 15, []);

  const profile: ProfileSlice["profile"] = {
    name: "Alex",
    activePath: "anxiety",
    enrolledPaths: ["anxiety", "sleep"] as PathKey[],
    xp: 3240,
    level: 5,
    streak: 9,
    longestStreak: 14,
    joinedOn: daysBeforeKey(anchor, 41),
  };

  return {
    profile,
    programmes: { anxiety, sleep },
    achievements: ACHIEVEMENTS.map((a) => ({ ...a })),
    moodEntries: seedMoodEntries(anchor),
    journalEntries: seedJournalEntries(anchor),
    missionLogs: {},
    demoMode: true,
    onboardedAt: null,
    demoAnchor: toDateKey(anchor),
  };
}
