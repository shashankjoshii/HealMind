import type {
  Achievement,
  DailyMission,
  JournalEntry,
  Meditation,
  MoodEntry,
  MoodKey,
  MoodOption,
  Phase,
  UserProfile,
} from "./types";
import { toDateKey } from "./utils";

/**
 * Deterministic PRNG (mulberry32). Seeded output keeps the server and client
 * renders identical — Math.random() here would cause hydration mismatches on
 * every chart in the app.
 */
function seeded(seed: number) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const MOOD_OPTIONS: MoodOption[] = [
  { key: "awful", emoji: "😞", label: "Awful", score: 1, color: "#f83b3b" },
  { key: "low", emoji: "😔", label: "Low", score: 2, color: "#ff9d9d" },
  { key: "numb", emoji: "😶", label: "Numb", score: 3, color: "#b0abcd" },
  { key: "okay", emoji: "🙂", label: "Okay", score: 4, color: "#ffb547" },
  { key: "hopeful", emoji: "🌤️", label: "Hopeful", score: 5, color: "#5fb0fc" },
  { key: "good", emoji: "😊", label: "Good", score: 6, color: "#47bd8b" },
  { key: "great", emoji: "✨", label: "Great", score: 7, color: "#24a271" },
];

export const MOOD_BY_KEY = Object.fromEntries(
  MOOD_OPTIONS.map((m) => [m.key, m]),
) as Record<MoodKey, MoodOption>;

export const PHASES: Phase[] = [
  {
    key: "detox",
    name: "Detox",
    startDay: 1,
    endDay: 14,
    tagline: "Create space to breathe",
    description:
      "Reduce contact, quiet the noise, and give your nervous system room to settle. This phase is about removing what keeps reopening the wound.",
    color: "#6c63ff",
  },
  {
    key: "acceptance",
    name: "Acceptance",
    startDay: 15,
    endDay: 30,
    tagline: "Let it be what it was",
    description:
      "Stop bargaining with the past. You'll work through the story you've been telling yourself and start seeing it more clearly.",
    color: "#3a90f5",
  },
  {
    key: "selfcare",
    name: "Self-care",
    startDay: 31,
    endDay: 45,
    tagline: "Come back to your body",
    description:
      "Sleep, movement, food, sunlight. Rebuilding the physical baseline that makes emotional work possible.",
    color: "#5fb0fc",
  },
  {
    key: "identity",
    name: "Identity",
    startDay: 46,
    endDay: 62,
    tagline: "Remember who you are",
    description:
      "Reclaim the parts of yourself that got folded into the relationship. Interests, friendships, and the way you take up space.",
    color: "#47bd8b",
  },
  {
    key: "growth",
    name: "Growth",
    startDay: 63,
    endDay: 79,
    tagline: "Understand the pattern",
    description:
      "Attachment styles, boundaries, and the recurring dynamics you want to leave behind. The part that changes the next relationship.",
    color: "#24a271",
  },
  {
    key: "forward",
    name: "New Beginning",
    startDay: 80,
    endDay: 90,
    tagline: "Walk forward",
    description:
      "Consolidate what you've learned, set what comes next, and close the chapter on your own terms.",
    color: "#ffb547",
  },
];

export function phaseForDay(day: number): Phase {
  return PHASES.find((p) => day >= p.startDay && day <= p.endDay) ?? PHASES[0];
}

export const CURRENT_DAY = 34;

export const USER: UserProfile = {
  name: "Alex",
  currentDay: CURRENT_DAY,
  streak: 12,
  longestStreak: 19,
  xp: 4820,
  level: 7,
  recoveryScore: 68,
  breakupDate: "2026-06-30",
  joinedOn: "2026-07-01",
  completedDays: Array.from({ length: CURRENT_DAY - 1 }, (_, i) => i + 1).filter(
    // A couple of missed days — a perfect streak reads as fake.
    (d) => d !== 9 && d !== 21 && d !== 22,
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
    const drift = 2.1 + progress * 2.6; // baseline mood climbs 2.1 -> 4.7
    const wobble = (rand() - 0.5) * 1.9;
    // Periodic dips — anniversaries, weekends alone, bad days.
    const setback = rand() < 0.13 ? -1.5 : 0;

    const score = Math.round(
      Math.min(7, Math.max(1, drift + wobble + setback)),
    );
    const mood = MOOD_OPTIONS.find((m) => m.score === score) ?? MOOD_OPTIONS[3];

    entries.push({
      date: toDateKey(date),
      mood: mood.key,
      energy: Math.round(Math.min(10, Math.max(1, 3 + progress * 4 + (rand() - 0.5) * 3))),
      stress: Math.round(Math.min(10, Math.max(1, 8 - progress * 4 + (rand() - 0.5) * 2.5))),
      anxiety: Math.round(Math.min(10, Math.max(1, 7.5 - progress * 3.5 + (rand() - 0.5) * 2.5))),
      confidence: Math.round(Math.min(10, Math.max(1, 3 + progress * 4.5 + (rand() - 0.5) * 2))),
      sleepHours: Number((4.8 + progress * 2.4 + (rand() - 0.5) * 1.6).toFixed(1)),
      sleepQuality: Math.round(Math.min(10, Math.max(1, 3.5 + progress * 4 + (rand() - 0.5) * 2.5))),
    });
  }

  return entries;
}

export const MOOD_HISTORY = generateMoodHistory(60);

export const TODAY_MISSION: DailyMission = {
  day: CURRENT_DAY,
  phase: "selfcare",
  title: "The kindness audit",
  intention:
    "Notice how you speak to yourself, and practise saying it differently.",
  estimatedMinutes: 18,
  steps: [
    {
      id: "s1",
      kind: "breathing",
      title: "Settle first",
      description: "Four rounds of box breathing to bring your baseline down.",
      duration: 3,
    },
    {
      id: "s2",
      kind: "cbt",
      title: "Catch the critic",
      description:
        "Write down one harsh thing you've said to yourself this week, then examine the evidence for and against it.",
      duration: 7,
      prompt:
        "What did you say to yourself? Would you say it to a friend in the same situation?",
    },
    {
      id: "s3",
      kind: "reflection",
      title: "Rewrite it",
      description:
        "Rephrase that thought the way someone who loves you would say it. Not falsely positive — just fair.",
      duration: 5,
      prompt: "Write the fairer version here.",
    },
    {
      id: "s4",
      kind: "gratitude",
      title: "One good thing",
      description: "Name one thing your body or mind did well today.",
      duration: 3,
      prompt: "Today I'm giving myself credit for…",
    },
  ],
};

export const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "j1",
    createdAt: "2026-08-02T21:14:00",
    title: "Didn't check their profile today",
    body: "First full day I haven't looked. I picked up my phone to do it maybe six times and put it back down. It felt less like willpower and more like being tired of the feeling afterwards. Small, but I noticed it.",
    mood: "hopeful",
    tags: ["no-contact", "progress"],
    locked: false,
  },
  {
    id: "j2",
    createdAt: "2026-07-31T23:40:00",
    title: "Bad night",
    body: "Couldn't sleep. Kept replaying the last conversation and finding new things I should have said. I know that's the overthinking loop and I know it doesn't lead anywhere. Knowing didn't help much at 2am.",
    mood: "low",
    tags: ["overthinking", "sleep"],
    locked: false,
  },
  {
    id: "j3",
    createdAt: "2026-07-28T18:05:00",
    title: "Coffee with Priya",
    body: "Talked about something other than the breakup for two whole hours. Laughed properly. On the walk home I realised I'd gone most of the afternoon without the weight in my chest.",
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
    title: "Anger, finally",
    body: "Been sad for weeks and today it turned into anger and honestly it felt better. Not proud of the things I thought, but it's the first time I've felt something with energy in it instead of just heavy.",
    mood: "okay",
    tags: ["anger", "acceptance"],
    locked: false,
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: "a1", name: "First Step", description: "Completed day 1", icon: "🌱", unlockedOn: 1, xp: 50 },
  { id: "a2", name: "One Week Down", description: "7-day streak", icon: "🔥", unlockedOn: 7, xp: 150 },
  { id: "a3", name: "Deep Diver", description: "Wrote 10 journal entries", icon: "📓", unlockedOn: 16, xp: 200 },
  { id: "a4", name: "Still Here", description: "Returned after a missed day", icon: "🤍", unlockedOn: 23, xp: 120 },
  { id: "a5", name: "Detox Complete", description: "Finished the Detox phase", icon: "🕊️", unlockedOn: 14, xp: 300 },
  { id: "a6", name: "Acceptance", description: "Finished the Acceptance phase", icon: "🌊", unlockedOn: 30, xp: 300 },
  { id: "a7", name: "Halfway", description: "Reached day 45", icon: "⛰️", unlockedOn: null, xp: 400 },
  { id: "a8", name: "New Chapter", description: "Completed all 90 days", icon: "🌅", unlockedOn: null, xp: 1000 },
];

export const MEDITATIONS: Meditation[] = [
  { id: "m1", title: "When the missing hits", category: "Heartbreak", minutes: 12, narrator: "Maya", description: "For the moments the longing arrives without warning.", favorite: true },
  { id: "m2", title: "Unclench your jaw", category: "Anxiety", minutes: 8, narrator: "Daniel", description: "A body scan for the tension you're holding without noticing.", favorite: false },
  { id: "m3", title: "Sleep without the replay", category: "Sleep", minutes: 22, narrator: "Maya", description: "Wind down when your mind keeps rerunning the same conversation.", favorite: true },
  { id: "m4", title: "You are not what happened", category: "Self-worth", minutes: 14, narrator: "Amara", description: "Separating your worth from the outcome of a relationship.", favorite: false },
  { id: "m5", title: "Putting down the grudge", category: "Forgiveness", minutes: 16, narrator: "Daniel", description: "Forgiveness as something you do for yourself, not for them.", favorite: false },
  { id: "m6", title: "The road ahead", category: "Moving on", minutes: 10, narrator: "Amara", description: "A forward-looking visualisation for when you're ready.", favorite: false },
  { id: "m7", title: "3am toolkit", category: "Sleep", minutes: 9, narrator: "Maya", description: "For waking at night with your chest tight.", favorite: false },
  { id: "m8", title: "Grounding in five senses", category: "Anxiety", minutes: 6, narrator: "Daniel", description: "Come back to the room when your thoughts spiral.", favorite: true },
];

export const AFFIRMATIONS = [
  "Healing isn't linear, and today's dip isn't a reversal.",
  "You are allowed to grieve something that was also wrong for you.",
  "The version of you on the other side of this is worth the walk.",
  "Missing someone doesn't mean you should go back.",
  "You're not behind. There is no schedule for this.",
  "You survived every single one of your worst days so far.",
];

export const DAILY_QUOTE = {
  text: "The wound is the place where the light enters you.",
  author: "Rumi",
};
