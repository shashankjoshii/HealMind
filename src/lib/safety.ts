/**
 * Crisis detection for the AI coach.
 *
 * WHY THIS EXISTS
 * ---------------
 * HealMind's users are, by definition, in distress. A non-trivial fraction of
 * them will at some point express suicidal ideation, self-harm intent, or intent
 * to harm someone else. An empathetic chatbot is the wrong response to that: it
 * keeps the person in the app, talking to software, at exactly the moment they
 * need a human.
 *
 * So the rule is: when this matches, the coach does NOT counsel, reflect,
 * reassure, or ask follow-up questions. It surfaces real help and gets out of
 * the way.
 *
 * SCOPE NOTE
 * ----------
 * This started as a breakup-recovery app, where the dominant risk was suicidal
 * ideation following a relationship ending. As a general mental health app the
 * surface is wider: disordered eating, panic, self-harm, substance crisis, and
 * abuse all show up, and each needs a different specialist service rather than
 * a generic hotline. Hence `CrisisCategory` and the per-category routing below.
 *
 * KNOWN LIMITS — do not treat this as sufficient on its own:
 *  - Keyword matching is crude. It misses euphemism, metaphor, misspelling,
 *    non-English input, and anything indirect ("I'm tired of being here").
 *  - It over-triggers on idiom ("this commute is killing me"). We accept false
 *    positives: showing a hotline to someone who didn't need it costs little;
 *    missing someone who did costs everything.
 *  - Detection currently runs client-side, so a modified client bypasses it.
 *    Production MUST re-run this server-side on every message.
 *  - A production build should back this with a model-based classifier, log
 *    events for clinical review, and involve a qualified clinician in tuning.
 */

export type CrisisCategory =
  | "suicide"
  | "selfharm"
  | "harm-others"
  | "eating"
  | "abuse"
  | "substance";

interface CrisisRule {
  category: CrisisCategory;
  patterns: RegExp[];
}

const RULES: CrisisRule[] = [
  // ORDER MATTERS — first match wins. Abuse is checked before suicide because
  // "he threatened to kill me" contains a suicide-rule substring ("kill me")
  // but needs the domestic abuse line, not a suicide line.
  {
    category: "abuse",
    patterns: [
      /\b(he|she|they|my\s+\w+)\s+(hits?|hit|beats?|beat|strangl\w+|chok\w+)\s+me\b/i,
      /\bafraid\s+(of|to\s+go)\s+home\b/i,
      /\bnot\s+safe\s+(at\s+home|here|with\s+(him|her|them))\b/i,
      /\bthreaten(ed|s)?\s+to\s+(kill|hurt)\s+me\b/i,
    ],
  },
  {
    category: "suicide",
    patterns: [
      /\bkill(ing)?\s+my\s?self\b/i,
      /\bkill\s+me\b/i,
      /\bend(ing)?\s+(my|it)\s+(life|all)\b/i,
      /\bend\s+it\s+all\b/i,
      /\btake\s+my\s+(own\s+)?life\b/i,
      /\bsuicid(e|al)\b/i,
      /\bwant\s+to\s+die\b/i,
      /\bdon'?t\s+want\s+to\s+(be\s+here|live|wake\s+up|exist)\b/i,
      /\bbetter\s+off\s+(without\s+me|dead)\b/i,
      /\bno\s+(point|reason)\s+(in\s+)?(living|being\s+here)\b/i,
      /\bnot\s+be\s+here\s+anymore\b/i,
      /\bwon'?t\s+be\s+around\s+much\s+longer\b/i,
      /\bgoodbye\s+forever\b/i,
    ],
  },
  {
    category: "selfharm",
    patterns: [
      /\bcut(ting)?\s+my\s?self\b/i,
      /\bself[-\s]?harm(ing)?\b/i,
      /\bhurt(ing)?\s+my\s?self\b/i,
      /\bburn(ing)?\s+my\s?self\b/i,
      /\bmake\s+my\s?self\s+bleed\b/i,
    ],
  },
  {
    category: "harm-others",
    patterns: [
      /\bhurt(ing)?\s+(them|him|her|someone|people)\b/i,
      /\bkill(ing)?\s+(them|him|her|someone)\b/i,
      /\bmake\s+them\s+pay\b/i,
    ],
  },
  {
    category: "eating",
    patterns: [
      /\b(purge|purging|make\s+my\s?self\s+(sick|throw\s+up)|throwing\s+up\s+after)\b/i,
      /\bhaven'?t\s+eaten\s+(in|for)\s+\w+\s+days?\b/i,
      /\bstopped\s+eating\b/i,
      /\bstarv(e|ing)\s+my\s?self\b/i,
      /\blaxative(s)?\s+to\s+lose\b/i,
    ],
  },
  {
    category: "substance",
    patterns: [
      /\boverdos(e|ed|ing)\b/i,
      /\btook\s+too\s+many\s+(pills|tablets)\b/i,
      /\bdrink(ing)?\s+my\s?self\s+to\s+death\b/i,
    ],
  },
];

export interface CrisisMatch {
  category: CrisisCategory;
}

/** Returns the matched category, or null. First match wins, in RULES order. */
export function detectCrisisCategory(text: string): CrisisCategory | null {
  for (const rule of RULES) {
    if (rule.patterns.some((re) => re.test(text))) return rule.category;
  }
  return null;
}

export function detectCrisis(text: string): boolean {
  return detectCrisisCategory(text) !== null;
}

export interface Helpline {
  region: string;
  name: string;
  contact: string;
  detail: string;
  href?: string;
  /** Which crisis categories this line is the right destination for. */
  categories: CrisisCategory[];
}

/**
 * PLACEHOLDER DATA — every number here must be verified against the operator's
 * own published contact details before this ships to real users, and re-checked
 * per launch region. A wrong number is worse than no number.
 */
export const HELPLINES: Helpline[] = [
  {
    region: "UK & ROI",
    name: "Samaritans",
    contact: "116 123",
    detail: "Free, 24/7, confidential. You don't have to be suicidal to call.",
    href: "tel:116123",
    categories: ["suicide", "selfharm", "substance"],
  },
  {
    region: "UK",
    name: "Shout",
    contact: "Text SHOUT to 85258",
    detail: "Free 24/7 text support if you'd rather not speak aloud.",
    categories: ["suicide", "selfharm", "eating", "abuse", "substance"],
  },
  {
    region: "US & Canada",
    name: "988 Suicide & Crisis Lifeline",
    contact: "988",
    detail: "Call or text 988. Free, 24/7.",
    href: "tel:988",
    categories: ["suicide", "selfharm", "substance"],
  },
  {
    region: "India",
    name: "Tele-MANAS",
    contact: "14416",
    detail: "Government mental health helpline, 24/7, multiple languages.",
    href: "tel:14416",
    categories: ["suicide", "selfharm", "eating", "substance"],
  },
  {
    region: "Australia",
    name: "Lifeline",
    contact: "13 11 14",
    detail: "Crisis support and suicide prevention, 24/7.",
    href: "tel:131114",
    categories: ["suicide", "selfharm", "substance"],
  },
  {
    region: "UK",
    name: "Beat",
    contact: "0808 801 0677",
    detail: "Eating disorder support for anyone struggling with food or body.",
    categories: ["eating"],
  },
  {
    region: "US",
    name: "ANAD Eating Disorders Helpline",
    contact: "(888) 375-7767",
    detail: "Free peer support for disordered eating.",
    categories: ["eating"],
  },
  {
    region: "UK",
    name: "National Domestic Abuse Helpline",
    contact: "0808 2000 247",
    detail: "Free, 24/7, confidential. For anyone experiencing abuse at home.",
    categories: ["abuse"],
  },
  {
    region: "US",
    name: "National Domestic Violence Hotline",
    contact: "800-799-7233",
    detail: "24/7 support, safety planning, and local referrals.",
    categories: ["abuse"],
  },
  {
    region: "International",
    name: "Find a helpline",
    contact: "findahelpline.com",
    detail: "Verified crisis lines in over 130 countries.",
    href: "https://findahelpline.com",
    categories: ["suicide", "selfharm", "harm-others", "eating", "abuse", "substance"],
  },
];

const EMERGENCY_LINE =
  "If you're in immediate danger, please call your local emergency number — 999 in the UK, 911 in the US, 112 across the EU.";

const SHARED_LINES = `**UK & ROI** — Samaritans, **116 123**
**US & Canada** — Lifeline, call or text **988**
**India** — Tele-MANAS, **14416**
**Australia** — Lifeline, **13 11 14**
**Anywhere else** — findahelpline.com`;

/**
 * The response the coach gives when crisis is detected. Deliberately short:
 * it names what it heard, states its own limits, and points to humans.
 */
const RESPONSES: Record<CrisisCategory, string> = {
  suicide: `I want to stop and be straight with you, because what you just said matters more than anything else we were talking about.

What you're describing sounds like more than I'm built to help with. I'm software — I can sit with a hard day, but I can't keep you safe, and you deserve someone who can.

Please talk to a person tonight. It's free, it's confidential, and you will not be judged or treated as dramatic for calling:

${SHARED_LINES}

${EMERGENCY_LINE}

I'm not going anywhere. But please make that call first.`,

  selfharm: `Thank you for telling me that — I know it isn't an easy thing to type.

I'm not the right support for this. Hurting yourself is something you deserve real, non-judgemental help with, and that has to come from a person, not an app.

${SHARED_LINES}

If you've already hurt yourself and the injury is serious, please treat it as a medical thing and get it looked at.

${EMERGENCY_LINE}`,

  "harm-others": `I need to stop our conversation here.

If you're having thoughts about hurting someone, that's something to talk through with a person right now — a crisis line, your GP, or emergency services if anyone is in immediate danger.

${SHARED_LINES}

${EMERGENCY_LINE}`,

  eating: `I want to pause, because what you've described sounds like it's about food and your body in a way I'm not equipped to help with safely.

Disordered eating gets better with proper support, and it's genuinely common — but it needs people who specialise in it.

**UK** — Beat, **0808 801 0677**
**US** — ANAD, **(888) 375-7767**
**Anywhere else** — findahelpline.com

If you've been restricting or purging for a while, please also see a doctor. There are physical effects worth checking, even if you feel fine.`,

  abuse: `I want to stop and take this seriously.

What you've described sounds like it may not be safe, and that's beyond what an app should be handling. Please talk to someone who can help with safety planning.

**UK** — National Domestic Abuse Helpline, **0808 2000 247**
**US** — National DV Hotline, **800-799-7233**
**Anywhere else** — findahelpline.com

${EMERGENCY_LINE}

If it's not safe for someone to see this conversation, you can clear it in Settings.`,

  substance: `I want to stop here, because this needs a person rather than an app.

If you've taken more than you should have, please treat it as urgent and call emergency services — even if you feel okay right now. Some effects are delayed.

${SHARED_LINES}

${EMERGENCY_LINE}`,
};

export function crisisResponseFor(category: CrisisCategory): string {
  return RESPONSES[category];
}

/** Back-compat for callers that don't branch on category. */
export const CRISIS_RESPONSE = RESPONSES.suicide;
