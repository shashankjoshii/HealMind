import type {
  Achievement,
  DailyMission,
  Habit,
  JournalEntry,
  Meditation,
  MoodEntry,
  MoodKey,
  MoodOption,
  PathKey,
  UserProfile,
} from "./types";
import { PATH_BY_KEY } from "./paths";
import { toDateKey } from "./utils";
import { seeded } from "./prng";

export { PATHS, PATH_BY_KEY, phaseForDay } from "./paths";

export const MOOD_OPTIONS: MoodOption[] = [
  { key: "awful", icon: "frown", label: "Awful", score: 1, color: "#f83b3b" },
  { key: "low", icon: "annoyed", label: "Low", score: 2, color: "#ff9d9d" },
  { key: "numb", icon: "ghost", label: "Numb", score: 3, color: "#b0abcd" },
  { key: "okay", icon: "smile", label: "Okay", score: 4, color: "#ffb547" },
  { key: "hopeful", icon: "cloud-sun", label: "Hopeful", score: 5, color: "#5fb0fc" },
  { key: "good", icon: "smile-plus", label: "Good", score: 6, color: "#47bd8b" },
  { key: "great", icon: "sparkles", label: "Great", score: 7, color: "#24a271" },
];

export const MOOD_BY_KEY = Object.fromEntries(
  MOOD_OPTIONS.map((m) => [m.key, m]),
) as Record<MoodKey, MoodOption>;

export const ACTIVE_PATH: PathKey = "anxiety";
export const CURRENT_DAY = 26;

export const USER: UserProfile = {
  name: "Alex",
  activePath: ACTIVE_PATH,
  enrolledPaths: ["anxiety", "sleep"],
  currentDay: CURRENT_DAY,
  streak: 9,
  longestStreak: 14,
  xp: 3240,
  level: 5,
  wellbeingScore: 64,
  joinedOn: "2026-07-09",
  completedDays: Array.from({ length: CURRENT_DAY - 1 }, (_, i) => i + 1).filter(
    // A couple of missed days — a perfect streak reads as fake.
    (d) => d !== 7 && d !== 16 && d !== 17,
  ),
};

/**
 * 60 days of mood history trending gently upward, with setbacks.
 * Recovery isn't linear and the chart shouldn't pretend it is.
 */
export function generateMoodHistory(days = 60): MoodEntry[] {
  const rand = seeded(20260803);
  const today = new Date("2026-08-03T12:00:00");
  const entries: MoodEntry[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const progress = (days - 1 - i) / (days - 1); // 0 -> 1 over the window
    const drift = 2.4 + progress * 2.4; // baseline mood climbs 2.4 -> 4.8
    const wobble = (rand() - 0.5) * 1.9;
    // Periodic dips — bad weeks, anniversaries, poor sleep.
    const setback = rand() < 0.13 ? -1.5 : 0;

    const score = Math.round(Math.min(7, Math.max(1, drift + wobble + setback)));
    const mood = MOOD_OPTIONS.find((m) => m.score === score) ?? MOOD_OPTIONS[3];

    entries.push({
      date: toDateKey(date),
      mood: mood.key,
      energy: Math.round(Math.min(10, Math.max(1, 3 + progress * 4 + (rand() - 0.5) * 3))),
      stress: Math.round(Math.min(10, Math.max(1, 8 - progress * 4 + (rand() - 0.5) * 2.5))),
      anxiety: Math.round(Math.min(10, Math.max(1, 7.8 - progress * 3.8 + (rand() - 0.5) * 2.5))),
      confidence: Math.round(Math.min(10, Math.max(1, 3 + progress * 4.5 + (rand() - 0.5) * 2))),
      sleepHours: Number((5.1 + progress * 2.2 + (rand() - 0.5) * 1.6).toFixed(1)),
      sleepQuality: Math.round(Math.min(10, Math.max(1, 3.5 + progress * 4 + (rand() - 0.5) * 2.5))),
    });
  }

  return entries;
}

export const MOOD_HISTORY = generateMoodHistory(60);

/* ------------------------------------------------------------------
   Daily missions — one per path, so switching path changes the work.
   ------------------------------------------------------------------ */

export const MISSIONS_BY_PATH: Record<PathKey, DailyMission> = {
  anxiety: {
    day: 26,
    path: "anxiety",
    phase: "regulate",
    title: "Name it to tame it",
    intention:
      "Put words to the feeling before it puts words to you. Naming an emotion measurably reduces its intensity.",
    estimatedMinutes: 16,
    steps: [
      {
        id: "a1",
        kind: "breathing",
        title: "Longer out than in",
        description:
          "Four counts in, six counts out. The extended exhale is what triggers the parasympathetic response — the ratio matters more than the depth.",
        duration: 4,
      },
      {
        id: "a2",
        kind: "somatic",
        title: "Where is it sitting?",
        description:
          "Scan for where the anxiety physically lives right now. Chest, jaw, stomach, shoulders. Don't try to change it — just locate it.",
        duration: 4,
        prompt: "Where do you feel it, and what does it actually feel like?",
      },
      {
        id: "a3",
        kind: "cbt",
        title: "The worry, written down",
        description:
          "Write the worry as a specific prediction rather than a vague dread. Vague fears can't be tested; specific ones can.",
        duration: 5,
        prompt: "What exactly are you predicting will happen? How likely is it, honestly?",
      },
      {
        id: "a4",
        kind: "reflection",
        title: "What would you tell a friend?",
        description:
          "You're kinder and more accurate about other people's worries than your own. Borrow that voice.",
        duration: 3,
        prompt: "Write what you'd say to a friend with this exact worry.",
      },
    ],
  },
  burnout: {
    day: 12,
    path: "burnout",
    phase: "recover",
    title: "The subtraction list",
    intention: "Find one thing to take off your plate this week, and actually take it off.",
    estimatedMinutes: 15,
    steps: [
      {
        id: "b1",
        kind: "reflection",
        title: "Where did the week go?",
        description: "List everything that took real energy in the last seven days — not just work.",
        duration: 5,
        prompt: "What actually consumed you this week?",
      },
      {
        id: "b2",
        kind: "behavioural",
        title: "Pick one to drop",
        description:
          "One thing gets cancelled, delegated, or deferred. Not reorganised — removed.",
        duration: 5,
        prompt: "What are you removing, and what will you say to whoever needs telling?",
      },
      {
        id: "b3",
        kind: "action",
        title: "Detachment window",
        description:
          "Choose a 90-minute block tonight with no work input at all. No email, no Slack, no 'quick check'.",
        duration: 5,
      },
    ],
  },
  lowmood: {
    day: 8,
    path: "lowmood",
    phase: "activate",
    title: "One small thing",
    intention:
      "Do something before you feel like it. Motivation follows action here, not the other way round.",
    estimatedMinutes: 14,
    steps: [
      {
        id: "l1",
        kind: "behavioural",
        title: "Pick something absurdly small",
        description:
          "Not 'clean the flat'. 'Put three things in the bin'. Small enough that it's almost silly to refuse.",
        duration: 4,
        prompt: "What's the smallest version of a thing you've been avoiding?",
      },
      {
        id: "l2",
        kind: "action",
        title: "Do it now",
        description: "Before you finish this session. It should take under five minutes.",
        duration: 5,
      },
      {
        id: "l3",
        kind: "reflection",
        title: "Rate it honestly",
        description:
          "How did your mood shift, if at all? Sometimes it doesn't. Recording it either way is how the pattern becomes visible over weeks.",
        duration: 5,
        prompt: "Mood before, mood after. What did you notice?",
      },
    ],
  },
  sleep: {
    day: 15,
    path: "sleep",
    phase: "restrict",
    title: "Hold the wake time",
    intention:
      "A fixed wake time is the single strongest lever in sleep. Today is about defending it even though you're tired.",
    estimatedMinutes: 12,
    steps: [
      {
        id: "s1",
        kind: "reflection",
        title: "Log last night honestly",
        description: "Time to bed, estimated time asleep, wake-ups, final wake time.",
        duration: 4,
        prompt: "What actually happened last night?",
      },
      {
        id: "s2",
        kind: "behavioural",
        title: "Set the boundary",
        description:
          "Confirm tomorrow's wake time — same as every day, including weekends. Then plan what you'll do if you wake at 3am: get up, dim light, no phone.",
        duration: 4,
        prompt: "Your 3am plan, in one sentence.",
      },
      {
        id: "s3",
        kind: "meditation",
        title: "Wind-down body scan",
        description: "Run this in the hour before bed, not in bed.",
        duration: 4,
      },
    ],
  },
  selfesteem: {
    day: 19,
    path: "selfesteem",
    phase: "origins",
    title: "Whose voice is that?",
    intention:
      "The inner critic usually has an accent. Today you work out where it was learned.",
    estimatedMinutes: 17,
    steps: [
      {
        id: "e1",
        kind: "reflection",
        title: "Write the sentence",
        description: "The harshest thing you've said to yourself this week, word for word.",
        duration: 4,
        prompt: "What exactly did you say to yourself?",
      },
      {
        id: "e2",
        kind: "cbt",
        title: "Trace it back",
        description:
          "Who first said something like that to you, or acted like it was true? It's rarely originally yours.",
        duration: 7,
        prompt: "Where do you think you learned this rule?",
      },
      {
        id: "e3",
        kind: "gratitude",
        title: "One piece of counter-evidence",
        description:
          "Something real from this week that contradicts it. Small counts.",
        duration: 6,
        prompt: "What's one fact that doesn't fit the story?",
      },
    ],
  },
  heartbreak: {
    day: 34,
    path: "heartbreak",
    phase: "selfcare",
    title: "The kindness audit",
    intention: "Notice how you speak to yourself, and practise saying it differently.",
    estimatedMinutes: 18,
    steps: [
      {
        id: "h1",
        kind: "breathing",
        title: "Settle first",
        description: "Four rounds of box breathing to bring your baseline down.",
        duration: 3,
      },
      {
        id: "h2",
        kind: "cbt",
        title: "Catch the critic",
        description:
          "Write down one harsh thing you've said to yourself this week, then examine the evidence for and against it.",
        duration: 7,
        prompt: "What did you say to yourself? Would you say it to a friend?",
      },
      {
        id: "h3",
        kind: "reflection",
        title: "Rewrite it",
        description:
          "Rephrase that thought the way someone who loves you would say it. Not falsely positive — just fair.",
        duration: 5,
        prompt: "Write the fairer version here.",
      },
      {
        id: "h4",
        kind: "gratitude",
        title: "One good thing",
        description: "Name one thing your body or mind did well today.",
        duration: 3,
        prompt: "Today I'm giving myself credit for…",
      },
    ],
  },
};

export const TODAY_MISSION = MISSIONS_BY_PATH[ACTIVE_PATH];

export const HABITS: Habit[] = [
  { id: "h1", name: "Breathwork", icon: "wind", week: [true, true, false, true, true, true, false], streak: 3 },
  { id: "h2", name: "Movement", icon: "footprints", week: [true, false, true, true, false, true, true], streak: 2 },
  { id: "h3", name: "No screens in bed", icon: "moon", week: [false, true, true, true, true, false, true], streak: 1 },
  { id: "h4", name: "Water", icon: "droplet", week: [true, true, true, true, true, true, true], streak: 12 },
];

export const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "j1",
    createdAt: "2026-08-02T21:14:00",
    title: "Got through the presentation",
    body: "I was convinced I'd freeze. I didn't. My hands shook for the first minute and then I forgot to be scared because I was busy talking. Writing this down because next time the prediction shows up I want evidence against it.",
    mood: "hopeful",
    tags: ["exposure", "work", "progress"],
    locked: false,
  },
  {
    id: "j2",
    createdAt: "2026-07-31T23:40:00",
    title: "Bad night",
    body: "Couldn't sleep. Kept running the same loop about money and then about whether I'm wasting my twenties. I know that's the 3am distortion and I know it doesn't lead anywhere. Knowing didn't help much at 3am.",
    mood: "low",
    tags: ["overthinking", "sleep"],
    locked: false,
  },
  {
    id: "j3",
    createdAt: "2026-07-28T18:05:00",
    title: "Coffee with Priya",
    body: "Talked about something other than work for two whole hours. Laughed properly. On the walk home I realised I'd gone most of the afternoon without the tight feeling in my chest.",
    mood: "good",
    tags: ["friends", "progress"],
    locked: false,
  },
  {
    id: "j4",
    createdAt: "2026-07-24T08:30:00",
    title: "Private",
    body: "This entry is locked.",
    mood: "numb",
    tags: ["private"],
    locked: true,
  },
  {
    id: "j5",
    createdAt: "2026-07-20T20:12:00",
    title: "Said no to something",
    body: "Turned down a project I'd normally have taken out of guilt. Felt sick for about an hour afterwards and then completely fine. Noting the hour, because I keep expecting the guilt to last forever and it never does.",
    mood: "okay",
    tags: ["boundaries", "work"],
    locked: false,
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: "a1", name: "First Step", description: "Completed day 1", icon: "sprout", unlockedOn: 1, xp: 50 },
  { id: "a2", name: "One Week Down", description: "7-day streak", icon: "flame", unlockedOn: 7, xp: 150 },
  { id: "a3", name: "Deep Diver", description: "Wrote 10 journal entries", icon: "notebook-pen", unlockedOn: 16, xp: 200 },
  { id: "a4", name: "Still Here", description: "Returned after a missed day", icon: "heart", unlockedOn: 18, xp: 120 },
  { id: "a5", name: "Phase One", description: "Finished your first phase", icon: "bird", unlockedOn: 12, xp: 300 },
  { id: "a6", name: "Explorer", description: "Started a second path", icon: "compass", unlockedOn: 21, xp: 250 },
  { id: "a7", name: "Halfway", description: "Reached the midpoint", icon: "mountain", unlockedOn: null, xp: 400 },
  { id: "a8", name: "Full Circle", description: "Completed a whole path", icon: "sunrise", unlockedOn: null, xp: 1000 },
];

export const MEDITATIONS: Meditation[] = [
  { id: "m1", title: "Unclench your jaw", category: "Anxiety", minutes: 8, narrator: "Daniel", description: "A body scan for tension you're holding without noticing.", favorite: true, paths: ["anxiety", "burnout"] },
  { id: "m2", title: "Grounding in five senses", category: "Grounding", minutes: 6, narrator: "Daniel", description: "Come back to the room when your thoughts spiral.", favorite: true, paths: ["anxiety", "lowmood"] },
  { id: "m3", title: "Sleep without the replay", category: "Sleep", minutes: 22, narrator: "Maya", description: "Wind down when your mind keeps rerunning the day.", favorite: true, paths: ["sleep", "anxiety"] },
  { id: "m4", title: "3am toolkit", category: "Sleep", minutes: 9, narrator: "Maya", description: "For waking at night with your chest tight.", favorite: false, paths: ["sleep"] },
  { id: "m5", title: "You are not your output", category: "Burnout", minutes: 13, narrator: "Amara", description: "Separating your worth from your productivity.", favorite: false, paths: ["burnout", "selfesteem"] },
  { id: "m6", title: "Permission to stop", category: "Burnout", minutes: 11, narrator: "Amara", description: "For when resting feels like failing.", favorite: false, paths: ["burnout"] },
  { id: "m7", title: "You are not what happened", category: "Self-worth", minutes: 14, narrator: "Amara", description: "Separating your worth from an outcome.", favorite: false, paths: ["selfesteem", "heartbreak"] },
  { id: "m8", title: "The kind voice", category: "Self-worth", minutes: 10, narrator: "Maya", description: "Practising self-compassion as an actual skill.", favorite: false, paths: ["selfesteem", "lowmood"] },
  { id: "m9", title: "Getting started when flat", category: "Low mood", minutes: 7, narrator: "Daniel", description: "A short activation practice for heavy mornings.", favorite: false, paths: ["lowmood"] },
  { id: "m10", title: "When the missing hits", category: "Heartbreak", minutes: 12, narrator: "Maya", description: "For the moments longing arrives without warning.", favorite: false, paths: ["heartbreak"] },
  { id: "m11", title: "Putting down the grudge", category: "Heartbreak", minutes: 16, narrator: "Daniel", description: "Forgiveness as something you do for yourself.", favorite: false, paths: ["heartbreak"] },
  { id: "m12", title: "One thing at a time", category: "Focus", minutes: 9, narrator: "Amara", description: "Narrow attention when everything feels urgent.", favorite: false, paths: ["burnout", "anxiety"] },
];

export const AFFIRMATIONS = [
  "Progress isn't linear, and today's dip isn't a reversal.",
  "You can feel anxious and still do the thing.",
  "Rest is not something you earn by finishing everything.",
  "You're not behind. There is no schedule for this.",
  "The version of you on the other side of this is worth the walk.",
  "You survived every single one of your worst days so far.",
];

export const DAILY_QUOTE = {
  text: "The wound is the place where the light enters you.",
  author: "Rumi",
};

/** Convenience accessor used across app screens. */
export function activePath() {
  return PATH_BY_KEY[USER.activePath];
}
