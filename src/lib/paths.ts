import type { Path, PathKey } from "./types";

/**
 * The six programmes. Each is genuinely different in structure — an anxiety
 * path is exposure-shaped and 60 days, a sleep path is protocol-shaped and 42.
 * Forcing all of them into one 90-day mould was the thing that made the old
 * single-track version feel generic.
 */
export const PATHS: Path[] = [
  {
    key: "anxiety",
    name: "Anxiety & overthinking",
    tagline: "Quiet the noise, get your day back",
    description:
      "Learn what your anxiety is actually doing, then practise the skills that shrink it — grounding, cognitive defusion, and gradual exposure to what you've been avoiding.",
    signals: [
      "Your mind races and won't stop",
      "You avoid things that make you nervous",
      "You feel tense or on-edge most days",
      "You replay conversations for hours",
    ],
    icon: "waves",
    gradient: ["#6c63ff", "#3a90f5"],
    accent: "#5b4fe8",
    totalDays: 60,
    phases: [
      {
        key: "understand",
        name: "Understand",
        startDay: 1,
        endDay: 12,
        tagline: "Learn what it's doing",
        description:
          "Anxiety is a threat-detection system running hot. Before you can turn it down you need to see it working — what sets it off, what it makes you do, and what it costs.",
        color: "#6c63ff",
        activities: [
          "Map your triggers and early warning signs",
          "Learn the anxiety cycle and where it loops",
          "Notice safety behaviours you didn't know you had",
          "Build a baseline you can measure against",
        ],
      },
      {
        key: "regulate",
        name: "Regulate",
        startDay: 13,
        endDay: 28,
        tagline: "Turn the volume down",
        description:
          "Physiological skills first, because you cannot think your way out of a body that's in alarm. Paced breathing, grounding, and progressive relaxation.",
        color: "#4f7cf0",
        activities: [
          "Daily paced breathing at a set time",
          "5-4-3-2-1 grounding for spike moments",
          "Progressive muscle relaxation before bed",
          "Cut the inputs that keep you activated",
        ],
      },
      {
        key: "challenge",
        name: "Challenge",
        startDay: 29,
        endDay: 44,
        tagline: "Question the thought",
        description:
          "CBT proper. Catch the automatic thought, test it against evidence, and practise holding it more lightly rather than arguing with it.",
        color: "#3a90f5",
        activities: [
          "Thought records for your loudest worries",
          "Name your thinking traps as they happen",
          "Cognitive defusion — thoughts as weather, not facts",
          "Worry postponement, done properly",
        ],
      },
      {
        key: "expose",
        name: "Face it",
        startDay: 45,
        endDay: 60,
        tagline: "Do the thing you've been avoiding",
        description:
          "Graded exposure. You build a ladder of avoided situations and climb it slowly. This is the part that actually shrinks anxiety long-term.",
        color: "#2472e3",
        activities: [
          "Build your avoidance ladder, easiest first",
          "One rung a week, repeated until it's dull",
          "Drop the safety behaviours you lean on",
          "Write your relapse plan for bad weeks",
        ],
      },
    ],
  },
  {
    key: "burnout",
    name: "Burnout & stress",
    tagline: "Refill what work drained",
    description:
      "Burnout isn't fixed by a holiday. This path works on load, boundaries, and recovery — the three things that decide whether you refill faster than you empty.",
    signals: [
      "You're exhausted even after sleeping",
      "Work you used to care about feels pointless",
      "You're cynical or short with people",
      "Sundays are ruined by dread",
    ],
    icon: "flame",
    gradient: ["#f99417", "#ffb547"],
    accent: "#e4740d",
    totalDays: 45,
    phases: [
      {
        key: "stop",
        name: "Stop the bleed",
        startDay: 1,
        endDay: 10,
        tagline: "Reduce the load first",
        description:
          "Nothing else works while the drain continues. This phase is about subtraction — what comes off the list this week, not what gets added.",
        color: "#f99417",
        activities: [
          "Audit where your hours actually go",
          "Cut or defer three commitments",
          "Set a hard stop time and defend it",
          "Separate urgent from merely loud",
        ],
      },
      {
        key: "recover",
        name: "Recover",
        startDay: 11,
        endDay: 26,
        tagline: "Rest that actually restores",
        description:
          "Most rest doesn't work because it's passive and screen-shaped. You'll learn which kinds of recovery refill you and build them into ordinary weeks.",
        color: "#e4740d",
        activities: [
          "Identify which rest actually recharges you",
          "Daily detachment window, no work input",
          "Movement as recovery, not another task",
          "Repair your sleep debt deliberately",
        ],
      },
      {
        key: "boundaries",
        name: "Boundaries",
        startDay: 27,
        endDay: 38,
        tagline: "Make it sustainable",
        description:
          "Recovery without changed boundaries just resets the clock on the next burnout. This is the scripts-and-conversations phase.",
        color: "#bd560e",
        activities: [
          "Scripts for declining without guilt",
          "Renegotiate one expectation at work",
          "Notice where you volunteer to over-function",
          "Protect one non-negotiable block a week",
        ],
      },
      {
        key: "meaning",
        name: "Reconnect",
        startDay: 39,
        endDay: 45,
        tagline: "Remember why you cared",
        description:
          "Cynicism is the last symptom to lift. This phase reconnects the work to something you actually value — or clarifies that it can't be.",
        color: "#964413",
        activities: [
          "Clarify what you actually value in work",
          "Find the parts still worth protecting",
          "Decide what needs to change structurally",
          "Build your early-warning checklist",
        ],
      },
    ],
  },
  {
    key: "lowmood",
    name: "Low mood",
    tagline: "Small steps back to yourself",
    description:
      "When everything feels heavy and pointless, motivation doesn't come first — action does. This path uses behavioural activation to break the withdrawal spiral.",
    signals: [
      "You've stopped doing things you enjoyed",
      "Everything takes more effort than it should",
      "You feel flat, heavy, or empty",
      "You're withdrawing from people",
    ],
    icon: "sprout",
    gradient: ["#24a271", "#47bd8b"],
    accent: "#16825b",
    totalDays: 60,
    phases: [
      {
        key: "activate",
        name: "Activate",
        startDay: 1,
        endDay: 16,
        tagline: "Action before motivation",
        description:
          "Waiting to feel like it is the trap. Behavioural activation reverses the order: do the small thing first, and the feeling follows later — sometimes much later.",
        color: "#24a271",
        activities: [
          "One tiny scheduled activity a day",
          "Track mood against what you actually did",
          "Rebuild a basic morning anchor",
          "Break tasks down past the point of silly",
        ],
      },
      {
        key: "connect",
        name: "Reconnect",
        startDay: 17,
        endDay: 32,
        tagline: "People, even when you don't want to",
        description:
          "Withdrawal feels protective and makes low mood worse. This phase rebuilds contact at a pace that doesn't overwhelm you.",
        color: "#1f9268",
        activities: [
          "Message one person you've gone quiet on",
          "Say yes to one thing a week",
          "Practise the low-energy version of socialising",
          "Notice which contact actually helps",
        ],
      },
      {
        key: "thoughts",
        name: "Untangle",
        startDay: 33,
        endDay: 48,
        tagline: "Work with the thinking",
        description:
          "Low mood distorts thinking in predictable ways — all-or-nothing, discounting the positive, mind-reading. Naming the pattern loosens its grip.",
        color: "#16825b",
        activities: [
          "Catch and name your thinking traps",
          "Evidence-testing for the harshest thoughts",
          "Self-compassion practice, done properly",
          "Rebuild a fairer view of yourself",
        ],
      },
      {
        key: "sustain",
        name: "Sustain",
        startDay: 49,
        endDay: 60,
        tagline: "Keep the ground you took",
        description:
          "Consolidate the habits that moved the needle and build a plan for the dips, because there will be dips.",
        color: "#12684b",
        activities: [
          "Identify what actually moved your mood",
          "Write your early-warning signs down",
          "Build a dip plan you can follow when flat",
          "Set one thing to look forward to monthly",
        ],
      },
    ],
  },
  {
    key: "sleep",
    name: "Sleep",
    tagline: "Nights that actually restore you",
    description:
      "Based on CBT-I, the first-line treatment for insomnia. It's stricter than sleep-hygiene advice and considerably more effective.",
    signals: [
      "You lie awake for ages",
      "You wake at 3am and can't get back",
      "You dread going to bed",
      "You're tired all day but wired at night",
    ],
    icon: "moon",
    gradient: ["#3a90f5", "#8f80ff"],
    accent: "#2472e3",
    totalDays: 42,
    phases: [
      {
        key: "baseline",
        name: "Baseline",
        startDay: 1,
        endDay: 7,
        tagline: "Find out what's really happening",
        description:
          "A week of honest sleep logging before changing anything. Most people are surprised by the gap between how they sleep and how they think they sleep.",
        color: "#5fb0fc",
        activities: [
          "Log sleep and wake times daily",
          "Track caffeine, alcohol, and screens",
          "Note what you do when you can't sleep",
          "Calculate your actual sleep efficiency",
        ],
      },
      {
        key: "restrict",
        name: "Rebuild the drive",
        startDay: 8,
        endDay: 24,
        tagline: "The hard, effective part",
        description:
          "Sleep restriction and stimulus control. You'll temporarily spend less time in bed to rebuild sleep pressure, and retrain your brain to associate bed with sleep.",
        color: "#3a90f5",
        activities: [
          "Fixed wake time, every single day",
          "Out of bed if awake more than 20 minutes",
          "Bed is for sleep only — no scrolling",
          "Gradually widen the window as efficiency rises",
        ],
      },
      {
        key: "quiet",
        name: "Quiet the mind",
        startDay: 25,
        endDay: 35,
        tagline: "For the 3am spiral",
        description:
          "Targets the racing thoughts and clock-watching that keep insomnia running once the schedule is fixed.",
        color: "#2472e3",
        activities: [
          "Constructive worry time, hours before bed",
          "A wind-down routine you'll actually do",
          "Drop clock-watching entirely",
          "Body scan for middle-of-night waking",
        ],
      },
      {
        key: "maintain",
        name: "Maintain",
        startDay: 36,
        endDay: 42,
        tagline: "Keep it after the programme",
        description:
          "Relapse prevention. Bad nights will happen; the plan stops one bad night becoming a bad month.",
        color: "#1d5cc0",
        activities: [
          "Write your one-bad-night protocol",
          "Know which rules you can relax",
          "Plan for travel and shift disruption",
          "Set a monthly efficiency check",
        ],
      },
    ],
  },
  {
    key: "selfesteem",
    name: "Self-esteem",
    tagline: "Stop being your own worst critic",
    description:
      "Low self-esteem is a set of learned beliefs, not a fact about you. This path traces where yours came from and builds a fairer, more durable view.",
    signals: [
      "Your inner voice is brutal",
      "You can't take a compliment",
      "You feel like a fraud at work",
      "You apologise for existing",
    ],
    icon: "sparkles",
    gradient: ["#8f80ff", "#ff9d9d"],
    accent: "#6c63ff",
    totalDays: 60,
    phases: [
      {
        key: "notice",
        name: "Notice the critic",
        startDay: 1,
        endDay: 14,
        tagline: "Hear what you say to yourself",
        description:
          "Most self-criticism runs below awareness. The first job is simply catching it in the act, without trying to fix it yet.",
        color: "#8f80ff",
        activities: [
          "Log your critical thoughts for a week",
          "Notice the tone, not just the words",
          "Spot the situations that summon it",
          "Ask whose voice it actually sounds like",
        ],
      },
      {
        key: "origins",
        name: "Origins",
        startDay: 15,
        endDay: 30,
        tagline: "Where the rules came from",
        description:
          "Core beliefs get installed early and then quietly enforced. Tracing them back makes them feel less like objective truth.",
        color: "#7a6bfb",
        activities: [
          "Map your core beliefs about yourself",
          "Trace them to where they were learned",
          "Identify the rules you live by",
          "Separate the belief from the evidence",
        ],
      },
      {
        key: "rebuild",
        name: "Rebuild",
        startDay: 31,
        endDay: 48,
        tagline: "Build a fairer view",
        description:
          "Not affirmations. Collecting real evidence against a belief you've never actually tested, and practising self-compassion as a skill.",
        color: "#6c63ff",
        activities: [
          "Keep a daily evidence log",
          "Practise accepting compliments without deflecting",
          "Self-compassion breaks at hard moments",
          "Rewrite one core rule to something liveable",
        ],
      },
      {
        key: "act",
        name: "Act like it",
        startDay: 49,
        endDay: 60,
        tagline: "Take up space",
        description:
          "Behaviour change consolidates belief change. Small acts of taking up space do more than any amount of thinking about it.",
        color: "#5b4fe8",
        activities: [
          "State a preference out loud, daily",
          "Ask for one thing you'd normally not",
          "Set a boundary and sit with the discomfort",
          "Write what you'd want a friend to know about you",
        ],
      },
    ],
  },
  {
    key: "heartbreak",
    name: "Heartbreak",
    tagline: "Heal from a breakup, properly",
    description:
      "A structured programme for the end of a relationship — whether it was four years, four months, or never officially anything at all.",
    signals: [
      "You check their profile constantly",
      "You keep replaying the ending",
      "You don't know who you are without them",
      "Everyone says you should be over it",
    ],
    icon: "heart",
    gradient: ["#ff9d9d", "#8f80ff"],
    accent: "#f83b3b",
    totalDays: 90,
    phases: [
      {
        key: "detox",
        name: "Detox",
        startDay: 1,
        endDay: 14,
        tagline: "Create space to breathe",
        description:
          "Reduce contact, quiet the noise, and give your nervous system room to settle. This phase removes what keeps reopening the wound.",
        color: "#ff9d9d",
        activities: [
          "Set up a no-contact plan you can keep",
          "Clear the digital triggers — mute, archive, unfollow",
          "Nightly wind-down to get sleep back",
          "Name the feelings without acting on them",
        ],
      },
      {
        key: "acceptance",
        name: "Acceptance",
        startDay: 15,
        endDay: 34,
        tagline: "Let it be what it was",
        description:
          "Stop bargaining with the past. You'll work through the story you've been telling yourself and start seeing it more clearly.",
        color: "#ff6b6b",
        activities: [
          "Write the honest version of the relationship",
          "Challenge the 'if only I had…' loop",
          "Separate grief for them from grief for the future",
          "Sit with anger without letting it drive",
        ],
      },
      {
        key: "selfcare",
        name: "Rebuild",
        startDay: 35,
        endDay: 56,
        tagline: "Come back to your body",
        description:
          "Sleep, movement, food, sunlight, people. Rebuilding the baseline that makes the emotional work possible.",
        color: "#8f80ff",
        activities: [
          "Rebuild a sleep and movement baseline",
          "Reconnect with two people you've gone quiet on",
          "Do one thing purely because you enjoy it",
          "Redesign your space so it feels like yours",
        ],
      },
      {
        key: "identity",
        name: "Identity",
        startDay: 57,
        endDay: 76,
        tagline: "Remember who you are",
        description:
          "Reclaim the parts of yourself that got folded into the relationship — interests, friendships, and the way you take up space.",
        color: "#6c63ff",
        activities: [
          "List what you gave up and take some back",
          "Revisit an interest that predates them",
          "Write who you are outside of being a partner",
          "Learn your attachment style and its cost",
        ],
      },
      {
        key: "forward",
        name: "Forward",
        startDay: 77,
        endDay: 90,
        tagline: "Walk forward",
        description:
          "Consolidate what you've learned, decide what comes next, and close the chapter on your own terms.",
        color: "#47bd8b",
        activities: [
          "Review 90 days of your own data",
          "Write a closing letter you never send",
          "Draft the boundaries you'll hold next time",
          "Decide what dating again looks like for you",
        ],
      },
    ],
  },
];

export const PATH_BY_KEY = Object.fromEntries(
  PATHS.map((p) => [p.key, p]),
) as Record<PathKey, Path>;

export function phaseForDay(path: Path, day: number) {
  return (
    path.phases.find((p) => day >= p.startDay && day <= p.endDay) ??
    path.phases[0]
  );
}
