import { ACHIEVEMENTS } from "@/lib/mock-data";
import { todayKey } from "@/lib/utils";
import { buildDemoState } from "../seed";
import type { AppState, MetaSlice, PersistedState, SliceCreator } from "../types";

/** A genuinely empty account, ready for onboarding — no demo content, no history, no unlocked badges. */
function freshState(): Partial<AppState> {
  return {
    profile: {
      name: "Alex",
      activePath: "anxiety",
      enrolledPaths: [],
      xp: 0,
      level: 1,
      streak: 0,
      longestStreak: 0,
      joinedOn: todayKey(),
    },
    programmes: {},
    achievements: ACHIEVEMENTS.map((a) => ({ ...a, unlockedOn: null })),
    moodEntries: {},
    journalEntries: {},
    missionLogs: {},
    conversation: [],
    demoMode: false,
    onboardedAt: null,
    demoAnchor: todayKey(),
  };
}

const PERSISTED_KEYS = [
  "profile",
  "programmes",
  "achievements",
  "moodEntries",
  "journalEntries",
  "missionLogs",
  "conversation",
  "coachMemory",
  "prefs",
  "sosHistory",
  "demoMode",
  "onboardedAt",
  "demoAnchor",
] as const satisfies readonly (keyof PersistedState)[];

export const createMetaSlice: SliceCreator<MetaSlice> = (set, get) => ({
  demoMode: true,
  onboardedAt: null,
  demoAnchor: todayKey(),

  completeOnboarding: ({ path, today }) => {
    set(freshState());
    const { enrol, switchPath, logMood } = get();
    enrol(path);
    switchPath(path);
    logMood(today);
    set({ demoMode: false, onboardedAt: todayKey() });
  },

  loadSampleData: () => {
    // Anchored to real "today", unlike the store's own initial state (which
    // must stay fixed at DEMO_ANCHOR for the SSR/first-paint hydration
    // invariant) — this only ever runs from a user click, well after hydration.
    set(buildDemoState(new Date()));
  },

  clearEverything: () => {
    set(freshState());
  },

  exportJson: () => {
    const state = get();
    const persisted = Object.fromEntries(
      PERSISTED_KEYS.map((key) => [key, state[key]]),
    ) as Pick<AppState, (typeof PERSISTED_KEYS)[number]>;
    return JSON.stringify(persisted, null, 2);
  },
});
