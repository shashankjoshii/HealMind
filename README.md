# HealMind

A structured 90-day breakup recovery web app. Next.js 16 · React 19 · TypeScript · Tailwind v4 · Framer Motion · Recharts.

**Current state: frontend only, backed by mock data.** No auth, no database, no payments. Every screen renders real, seeded content so the product can be evaluated end to end before backend work starts.

## Running it

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## Routes

| Route | What it is |
|---|---|
| `/` | Landing page — hero, how it works, 15 features, interactive 90-day timeline, testimonials, pricing |
| `/onboarding` | 8-question assessment → recovery score + generated phase plan |
| `/dashboard` | Progress ring, today's mission, streak, mood chart, affirmation, achievements |
| `/today` | Step-by-step daily mission with box-breathing pacer and completion confetti |
| `/mood` | Mood check-in (7-point scale + 5 sliders), trend charts, 60-day heatmap |
| `/journal` | Entry composer with prompts, mood tagging, search, lockable entries |
| `/coach` | AI coach chat — **includes the crisis safety layer, see below** |
| `/journey` | Gamified 90-day roadmap, XP/levels, growing healing tree, achievements |
| `/meditate` | Meditation library with category filter and favourites |
| `/analytics` | Trend cards, recovery score, completion rate, generated insights |
| `/community` | Anonymous groups and discussion threads |
| `/settings` | Theme, notifications, privacy, data export, account deletion |
| `/crisis` | Verified helplines by region |

## Architecture

```
src/
  app/
    (app)/           # authenticated shell — sidebar layout wraps these
    crisis/          # deliberately outside the shell; reachable without an account
    onboarding/
  components/
    ui/              # Button, Card, Badge, ProgressRing, Slider, Input
    marketing/       # landing page sections
    app/             # sidebar, charts
  lib/
    types.ts         # domain models — the contract for a future backend
    mock-data.ts     # seeded data satisfying those models
    safety.ts        # crisis detection + helplines
```

**Design tokens** live in `src/app/globals.css` as Tailwind v4 `@theme` variables plus semantic surface tokens (`--surface`, `--text`, `--border`) that flip under `.dark`. Components reference the semantic tokens, so theming stays in one file.

**Determinism matters.** `mock-data.ts` uses a seeded PRNG (mulberry32) rather than `Math.random()`, and the confetti and healing-tree placements are computed from indices. Random values would produce server/client hydration mismatches on every chart.

## The crisis safety layer — read before changing `/coach`

`src/lib/safety.ts` intercepts messages indicating suicidal ideation, self-harm, or intent to harm others. On a match the coach **does not** counsel, reflect, or ask follow-up questions — it states its limits and surfaces helplines. This is a deliberate product decision: an empathetic chatbot keeps someone talking to software at the moment they most need a person.

The current implementation is keyword-based and **is not sufficient for production**:

- It misses euphemism, metaphor, misspelling, and non-English input.
- Detection runs client-side, so a modified client bypasses it.
- The helpline numbers are unverified placeholders.

Before this ships to real users:

1. **Re-run detection server-side** on every message. Client-side is a UX nicety, not a control.
2. **Add a model-based classifier** behind the keyword pass — keywords catch the explicit cases, a classifier catches the indirect ones ("I'm tired of being here").
3. **Verify every helpline number** for every region you launch in. A wrong number is worse than none.
4. **Involve a qualified clinician** in tuning thresholds and reviewing the response copy.
5. **Log crisis events** (privately, minimally) so the response can be audited and improved.

`npm run test:safety` exercises the matcher against 14 must-flag and 8 must-not-flag phrasings.

## What isn't built

Auth, database, Stripe, PWA/offline, blog, exercise library (CBT/ACT beyond what's in the daily mission), voice notes, photo memories, notifications, and real audio playback for meditations. `src/lib/types.ts` is the seam — implement those shapes against a real backend and the UI is unchanged.

## Disclaimer

HealMind is a self-help tool. It is not a medical device, not a crisis service, and not a substitute for professional care.
