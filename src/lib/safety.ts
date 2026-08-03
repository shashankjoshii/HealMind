/**
 * Crisis detection for the AI coach.
 *
 * WHY THIS EXISTS
 * ---------------
 * HealMind's users are, by definition, in acute emotional distress. A non-trivial
 * fraction of them will at some point express suicidal ideation, self-harm intent,
 * or intent to harm someone else. An empathetic chatbot is the wrong response to
 * that: it keeps the person in the app, talking to software, at exactly the moment
 * they need a human.
 *
 * So the rule is: when this matches, the coach does NOT counsel, reflect, reassure,
 * or ask follow-up questions. It surfaces real help and gets out of the way.
 *
 * KNOWN LIMITS — do not treat this as sufficient on its own:
 *  - Keyword matching is crude. It misses euphemism, metaphor, misspelling,
 *    non-English input, and anything indirect ("I'm tired of being here").
 *  - It over-triggers on idiom ("this commute is killing me"). We accept false
 *    positives: showing a hotline to someone who didn't need it costs little;
 *    missing someone who did costs everything.
 *  - A production build should back this with a model-based classifier, run
 *    detection server-side where it can't be bypassed, log events for clinical
 *    review, and involve a qualified clinician in tuning it.
 */

/** Phrases that indicate active risk to self or others. */
const CRISIS_PATTERNS: RegExp[] = [
  /\bkill(ing)?\s+my\s?self\b/i,
  /\bkill\s+me\b/i,
  /\bend(ing)?\s+(my|it)\s+(life|all)\b/i,
  /\bend\s+it\s+all\b/i,
  /\btake\s+my\s+(own\s+)?life\b/i,
  /\bsuicid(e|al)\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+(be\s+here|live|wake\s+up)\b/i,
  /\bbetter\s+off\s+(without\s+me|dead)\b/i,
  /\bno\s+(point|reason)\s+(in\s+)?living\b/i,
  /\bcut(ting)?\s+my\s?self\b/i,
  /\bself[-\s]?harm\b/i,
  /\bhurt(ing)?\s+my\s?self\b/i,
  /\boverdose\b/i,
  /\bhurt(ing)?\s+(them|him|her|someone)\b/i,
  /\bkill(ing)?\s+(them|him|her|someone)\b/i,
];

export function detectCrisis(text: string): boolean {
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

export interface Helpline {
  region: string;
  name: string;
  contact: string;
  detail: string;
  href?: string;
}

/**
 * Verify these before shipping to any region — numbers change, and a wrong
 * number here is worse than none.
 */
export const HELPLINES: Helpline[] = [
  {
    region: "UK & ROI",
    name: "Samaritans",
    contact: "116 123",
    detail: "Free, 24/7, confidential. You don't have to be suicidal to call.",
    href: "tel:116123",
  },
  {
    region: "UK",
    name: "Shout",
    contact: "Text SHOUT to 85258",
    detail: "Free 24/7 text support if you'd rather not speak aloud.",
  },
  {
    region: "US & Canada",
    name: "988 Suicide & Crisis Lifeline",
    contact: "988",
    detail: "Call or text 988. Free, 24/7.",
    href: "tel:988",
  },
  {
    region: "India",
    name: "Tele-MANAS",
    contact: "14416",
    detail: "Government mental health helpline, 24/7, multiple languages.",
    href: "tel:14416",
  },
  {
    region: "Australia",
    name: "Lifeline",
    contact: "13 11 14",
    detail: "Crisis support and suicide prevention, 24/7.",
    href: "tel:131114",
  },
  {
    region: "International",
    name: "Find a helpline",
    contact: "findahelpline.com",
    detail: "Verified crisis lines in over 130 countries.",
    href: "https://findahelpline.com",
  },
];

/**
 * The one response the coach gives when crisis is detected. Deliberately short:
 * it names what it heard, states its own limits, and points to humans.
 */
export const CRISIS_RESPONSE = `I want to stop and be straight with you, because what you just said matters more than anything else we were talking about.

What you're describing sounds like more than I'm built to help with. I'm software — I can sit with a hard day, but I can't keep you safe, and you deserve someone who can.

Please talk to a person tonight. It's free, it's confidential, and you will not be judged or treated as dramatic for calling:

**UK & ROI** — Samaritans, **116 123**
**US & Canada** — Lifeline, call or text **988**
**India** — Tele-MANAS, **14416**
**Australia** — Lifeline, **13 11 14**
**Anywhere else** — findahelpline.com

If you're in immediate danger, please call your local emergency number — 999 in the UK, 911 in the US, 112 across the EU.

I'm not going anywhere. But please make that call first.`;
