/**
 * Domain models for HealMind.
 *
 * These are the contract between the UI and the data layer. Today they're
 * satisfied by the seeded mock data in `mock-data.ts`; swapping in a real
 * backend means implementing the same shapes and nothing in the UI changes.
 */

export type MoodKey =
  | "awful"
  | "low"
  | "numb"
  | "okay"
  | "hopeful"
  | "good"
  | "great";

export interface MoodOption {
  key: MoodKey;
  emoji: string;
  label: string;
  /** 1–7, used for charting. */
  score: number;
  color: string;
}

export interface MoodEntry {
  /** Local date key, YYYY-MM-DD. One entry per day. */
  date: string;
  mood: MoodKey;
  energy: number; // 1–10
  stress: number; // 1–10
  anxiety: number; // 1–10
  confidence: number; // 1–10
  sleepHours: number;
  sleepQuality: number; // 1–10
  note?: string;
}

/* ------------------------------------------------------------------
   Paths
   ------------------------------------------------------------------
   A "path" is a self-contained programme for one concern. Users pick one
   as their primary focus at onboarding and can switch or add later.
   Heartbreak is one path among several, not the shape of the whole app.
   ------------------------------------------------------------------ */

export type PathKey =
  | "anxiety"
  | "burnout"
  | "lowmood"
  | "sleep"
  | "selfesteem"
  | "heartbreak";

export interface Path {
  key: PathKey;
  name: string;
  /** One-line pitch used on cards and the picker. */
  tagline: string;
  description: string;
  /** Short second-person symptom lines — "pick the one that sounds like you". */
  signals: string[];
  emoji: string;
  /** Two hex stops for this path's gradient. */
  gradient: [string, string];
  accent: string;
  /** Programme length in days. Not every concern fits 90. */
  totalDays: number;
  phases: Phase[];
}

export interface Phase {
  key: string;
  name: string;
  /** Inclusive day range within the parent path's programme. */
  startDay: number;
  endDay: number;
  tagline: string;
  description: string;
  color: string;
  /** Bullet list shown when the phase is expanded. */
  activities: string[];
}

export type MissionKind =
  | "reflection"
  | "cbt"
  | "meditation"
  | "breathing"
  | "gratitude"
  | "action"
  | "journal"
  | "somatic"
  | "behavioural";

export interface MissionStep {
  id: string;
  kind: MissionKind;
  title: string;
  description: string;
  /** Minutes. */
  duration: number;
  prompt?: string;
}

export interface DailyMission {
  day: number;
  path: PathKey;
  /** A `Phase.key` from this path's `phases` array (see paths.ts) — not a free-form label. */
  phase: string;
  title: string;
  intention: string;
  steps: MissionStep[];
  /** Total minutes across all steps. */
  estimatedMinutes: number;
}

export interface JournalEntry {
  id: string;
  createdAt: string; // ISO
  title: string;
  body: string;
  mood: MoodKey;
  tags: string[];
  /** Locked entries are blurred in the timeline until unlocked. */
  locked: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedOn: number | null; // day number, null = still locked
  xp: number;
}

export interface Meditation {
  id: string;
  title: string;
  category: MeditationCategory;
  minutes: number;
  narrator: string;
  description: string;
  favorite: boolean;
  /** Paths this session is especially relevant to. */
  paths: PathKey[];
}

export type MeditationCategory =
  | "Anxiety"
  | "Sleep"
  | "Burnout"
  | "Self-worth"
  | "Low mood"
  | "Heartbreak"
  | "Focus"
  | "Grounding";

export type ChatRole = "user" | "coach";

/**
 * A quick-reply chip attached to a coach message. `payload` is a discriminated
 * union so a chip can do more than echo its own label back as a chat message —
 * "Yes, let's breathe" should actually open a breathing tool, not restart the
 * classifier with that literal string.
 *
 * `intent`/`flow` payload variants (routing into the weighted intent
 * classifier and multi-turn flows) and the `openSos` tool key are added once
 * those modules exist; for now `message` and `navigate` cover current usage.
 */
export interface Suggestion {
  label: string;
  payload: { type: "message"; text: string } | { type: "navigate"; href: string };
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  /** Set when the safety layer intercepted this turn. */
  safety?: "crisis";
  /** Quick-reply chips offered alongside a coach message. */
  suggestions?: Suggestion[];
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  /** Days of the last 7 on which this was completed, most recent last. */
  week: boolean[];
  streak: number;
}

export interface UserProfile {
  name: string;
  /** The path the user is actively working through. */
  activePath: PathKey;
  /** Paths they've enrolled in, including completed ones. */
  enrolledPaths: PathKey[];
  /** Current day within the active path's programme, 1-indexed. */
  currentDay: number;
  streak: number;
  longestStreak: number;
  xp: number;
  level: number;
  /** 0–100 composite of mood, consistency and self-reported wellbeing. */
  wellbeingScore: number;
  joinedOn: string;
  completedDays: number[];
}
