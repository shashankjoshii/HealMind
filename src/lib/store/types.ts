import type { StateCreator } from "zustand";
import type {
  Achievement,
  ChatMessage,
  JournalEntry,
  MoodEntry,
  PathKey,
  UserProfile,
} from "@/lib/types";

/**
 * zustand v5 + React 19: a selector that returns a fresh object/array every
 * call needs `useShallow` (from `zustand/react/shallow`) at the call site.
 * v5 dropped v4's `useStore(selector, shallow)` overload — a selector like
 * `(s) => ({ a: s.a, b: s.b })` without `useShallow` causes an infinite
 * re-render loop, not just a wasted render. See src/lib/store/selectors.ts.
 */
export type SliceCreator<T> = StateCreator<
  AppState,
  [["zustand/persist", unknown]],
  [],
  T
>;

/** Store-layer wrapper — marks a record as part of the seeded demo state, not real user data. */
export interface StoredMoodEntry extends MoodEntry {
  seeded?: true;
}

/** Store-layer wrapper — marks a record as part of the seeded demo state, not real user data. */
export interface StoredJournalEntry extends JournalEntry {
  seeded?: true;
}

/** Per-path progress. `/paths` promises progress is kept on every path a user enrols in. */
export interface ProgrammeState {
  path: PathKey;
  startedOn: string; // YYYY-MM-DD
  /** Progress-based, not calendar-based: min(totalDays, completedDays.length + 1). */
  currentDay: number;
  completedDays: number[];
  /** Dates drive streak; days drive content. Kept separate on purpose. */
  completedDates: string[];
}

export interface ProfileSlice {
  profile: Pick<
    UserProfile,
    | "name"
    | "activePath"
    | "enrolledPaths"
    | "xp"
    | "level"
    | "streak"
    | "longestStreak"
    | "joinedOn"
  >;
  programmes: Partial<Record<PathKey, ProgrammeState>>;
  achievements: Achievement[];
  enrol: (path: PathKey) => void;
  switchPath: (path: PathKey) => void;
  awardXp: (amount: number) => void;
}

export interface MoodSlice {
  moodEntries: Record<string, StoredMoodEntry>;
  /** Upsert — one entry per date key. */
  logMood: (entry: MoodEntry) => void;
}

export interface JournalSlice {
  journalEntries: Record<string, StoredJournalEntry>;
  addEntry: (entry: Omit<JournalEntry, "id" | "createdAt">) => JournalEntry;
  updateEntry: (id: string, patch: Partial<Omit<JournalEntry, "id">>) => void;
  deleteEntry: (id: string) => void;
}

export interface MissionLog {
  path: PathKey;
  day: number;
  blockIds: string[];
  startedAt: string; // ISO
  completedAt: string | null; // ISO
  responses: Record<string, string>; // keyed by MissionStep.id
  xpAwarded: number;
}

export interface MissionSlice {
  missionLogs: Record<string, MissionLog>; // keyed by `${path}:${day}`
  startMission: (path: PathKey, day: number, blockIds: string[]) => void;
  saveStepResponse: (
    path: PathKey,
    day: number,
    stepId: string,
    text: string,
  ) => void;
  completeMission: (
    path: PathKey,
    day: number,
  ) => { xp: number; streak: number; unlocked: Achievement[] };
}

/**
 * Placeholder shape ahead of the Phase 5 coach classifier — `lastIntent` and
 * `pendingFlow` are plain strings for now rather than importing IntentKey /
 * FlowKey from src/lib/coach/*, which doesn't exist until that phase.
 */
export interface CoachMemoryState {
  turnCount: number;
  lastIntent: string | null;
  intentCounts: Record<string, number>;
  pendingFlow: string | null;
  flowStep: number;
  flowData: Record<string, string>;
  usedTemplateIds: string[];
}

export interface CoachSlice {
  conversation: ChatMessage[];
  coachMemory: CoachMemoryState;
  addMessage: (message: ChatMessage) => void;
  setCoachMemory: (patch: Partial<CoachMemoryState>) => void;
  resetConversation: () => void;
}

export interface PrefsSlice {
  prefs: {
    sound: boolean;
    lockJournal: boolean;
    anonymousCommunity: boolean;
    analyticsOptIn: boolean;
    notifications: {
      dailyMission: boolean;
      moodReminder: boolean;
      journalNudge: boolean;
      weeklyReport: boolean;
      communityReplies: boolean;
    };
  };
  setPref: <K extends keyof PrefsSlice["prefs"]>(
    key: K,
    value: PrefsSlice["prefs"][K],
  ) => void;
  // Theme is intentionally NOT here — it lives outside the store entirely.
  // See src/components/theme-provider.tsx and CLAUDE.md's theming section:
  // the <html class="dark"> is the single source of truth, synced via
  // useSyncExternalStore, not mirrored into React/zustand state.
}

/** A tool key from the six SOS tools (Phase 4). Lives here so the mission composer's `widget` field and the coach's `openSos` suggestion payload (Phase 5) can share it without a circular import. */
export type SosToolKey =
  | "box"
  | "478"
  | "sigh"
  | "grounding"
  | "body-scan"
  | "panic-first-aid";

export interface SosHistoryEntry {
  at: string; // ISO
  tool: SosToolKey;
  seconds: number;
  helped: boolean | null;
}

export interface SosSlice {
  // sosOpen/sosTool/sosStartedAt are transient UI state — excluded from partialize.
  sosOpen: boolean;
  sosTool: SosToolKey | null;
  sosStartedAt: string | null;
  sosHistory: SosHistoryEntry[]; // persisted, FIFO cap 200
  openSos: (tool?: SosToolKey) => void;
  closeSos: (outcome?: { seconds: number; helped: boolean | null }) => void;
}

export interface MetaSlice {
  demoMode: boolean;
  onboardedAt: string | null;
  /**
   * YYYY-MM-DD the demo content's dates are currently shifted to. Only
   * meaningful while `demoMode` is true. reanchorDemoDates() (rehydrate.ts)
   * shifts every demo date by `today - demoAnchor` and then advances this
   * to today — NOT by `today - DEMO_ANCHOR` (the fixed authoring constant
   * in seed.ts) — so re-opening the app on consecutive days shifts dates
   * incrementally instead of re-applying the full offset from scratch and
   * drifting them further forward each session.
   */
  demoAnchor: string;
  /** Clears seeded demo records and writes exactly one real entry derived from onboarding answers. */
  completeOnboarding: (input: {
    path: PathKey;
    today: MoodEntry;
  }) => void;
  loadSampleData: () => void;
  clearEverything: () => void;
  exportJson: () => string;
}

export interface AppState
  extends ProfileSlice,
    MoodSlice,
    JournalSlice,
    MissionSlice,
    CoachSlice,
    PrefsSlice,
    SosSlice,
    MetaSlice {}

/** The subset of AppState written to localStorage. Everything else (sosOpen, sosTool, sosStartedAt) is transient UI state. */
export type PersistedState = Omit<
  AppState,
  | "enrol"
  | "switchPath"
  | "awardXp"
  | "logMood"
  | "addEntry"
  | "updateEntry"
  | "deleteEntry"
  | "startMission"
  | "saveStepResponse"
  | "completeMission"
  | "addMessage"
  | "setCoachMemory"
  | "resetConversation"
  | "setPref"
  | "openSos"
  | "closeSos"
  | "completeOnboarding"
  | "loadSampleData"
  | "clearEverything"
  | "exportJson"
  | "sosOpen"
  | "sosTool"
  | "sosStartedAt"
>;
