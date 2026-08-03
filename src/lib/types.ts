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

export type PhaseKey =
  | "detox"
  | "acceptance"
  | "selfcare"
  | "identity"
  | "growth"
  | "forward";

export interface Phase {
  key: PhaseKey;
  name: string;
  /** Inclusive day range within the 90-day programme. */
  startDay: number;
  endDay: number;
  tagline: string;
  description: string;
  color: string;
}

export type MissionKind =
  | "reflection"
  | "cbt"
  | "meditation"
  | "breathing"
  | "gratitude"
  | "action"
  | "journal";

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
  phase: PhaseKey;
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
  category:
    | "Heartbreak"
    | "Sleep"
    | "Anxiety"
    | "Self-worth"
    | "Forgiveness"
    | "Moving on";
  minutes: number;
  narrator: string;
  description: string;
  favorite: boolean;
}

export type ChatRole = "user" | "coach";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  /** Set when the safety layer intercepted this turn. */
  safety?: "crisis";
  /** Quick-reply chips offered alongside a coach message. */
  suggestions?: string[];
}

export interface UserProfile {
  name: string;
  /** Current day in the 90-day programme, 1-indexed. */
  currentDay: number;
  streak: number;
  longestStreak: number;
  xp: number;
  level: number;
  /** 0–100 composite of mood, consistency and self-reported confidence. */
  recoveryScore: number;
  breakupDate: string;
  joinedOn: string;
  completedDays: number[];
}
