/**
 * zustand v5 + React 19: a selector that returns a fresh object/array on
 * every call (e.g. `(s) => ({ a: s.a, b: s.b })`) needs `useShallow` from
 * `zustand/react/shallow`. v5 dropped v4's `useStore(selector, shallow)`
 * overload, so without it such a selector causes an infinite re-render loop,
 * not just a wasted one. Prefer the primitive selectors in ./selectors.ts.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createCoachSlice } from "./slices/coach";
import { createJournalSlice } from "./slices/journal";
import { createMetaSlice } from "./slices/meta";
import { createMissionSlice } from "./slices/missions";
import { createMoodSlice } from "./slices/mood";
import { createPrefsSlice } from "./slices/prefs";
import { createProfileSlice } from "./slices/profile";
import { createSosSlice } from "./slices/sos";
import { runMigrations } from "./migrations";
import { recomputeStreak, reanchorDemoDates } from "./rehydrate";
import { buildDemoState } from "./seed";
import type { AppState, PersistedState } from "./types";

const STORE_VERSION = 1;

export const useAppStore = create<AppState>()(
  persist<AppState, [], [], PersistedState>(
    (...a) => ({
      ...createProfileSlice(...a),
      ...createMoodSlice(...a),
      ...createJournalSlice(...a),
      ...createMissionSlice(...a),
      ...createCoachSlice(...a),
      ...createPrefsSlice(...a),
      ...createSosSlice(...a),
      ...createMetaSlice(...a),
      // Overrides the empty/default data above with the seeded demo content,
      // so this is what both the server render and the first client render
      // use — see plan.md's hydration risk note. Action functions from the
      // slices above are untouched since buildDemoState() returns data only.
      ...buildDemoState(),
    }),
    {
      name: "healmind-state",
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      // Rehydration must not run at module-import time (before React
      // hydrates) or the server/client HTML would mismatch. StoreHydrator
      // calls useAppStore.persist.rehydrate() manually after mount instead.
      skipHydration: true,
      partialize: (state) => ({
        profile: state.profile,
        programmes: state.programmes,
        achievements: state.achievements,
        moodEntries: state.moodEntries,
        journalEntries: state.journalEntries,
        missionLogs: state.missionLogs,
        conversation: state.conversation,
        coachMemory: state.coachMemory,
        prefs: state.prefs,
        sosHistory: state.sosHistory,
        demoMode: state.demoMode,
        onboardedAt: state.onboardedAt,
        demoAnchor: state.demoAnchor,
        // sosOpen / sosTool / sosStartedAt intentionally excluded — transient UI.
      }),
      migrate: (persisted, fromVersion) =>
        runMigrations(persisted, fromVersion) as PersistedState,
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) {
          // Corrupt localStorage must not brick the app. This runs live
          // (well after mount), so — unlike the store's own initial state —
          // it can safely anchor to real "today" rather than DEMO_ANCHOR.
          useAppStore.setState({ ...buildDemoState(new Date()), demoMode: true });
          return;
        }
        useAppStore.setState({
          ...recomputeStreak(state),
          ...reanchorDemoDates(state),
        });
      },
    },
  ),
);
