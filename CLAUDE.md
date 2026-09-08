# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

HealMind — structured mental health programmes (anxiety, burnout, low mood, sleep, self-esteem, heartbreak). Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Framer Motion · Recharts · Zustand.

**Frontend only, backed by seeded mock data.** No auth, no database, no payments, no real backend. Every screen must render real-looking content from the mock data so the product can be evaluated end to end. `src/lib/types.ts` is the seam for a future backend — implement those shapes and the UI is meant to work unchanged.

## Commands

```bash
npm run dev          # http://localhost:3000
npm run build         # production build
npm run lint
npm run test:safety   # crisis-detection regex regression test (scripts/safety-check.mjs)
```

There is no general test runner — `test:safety` is the only automated test in the repo. It parses the `RULES` regexes directly out of `src/lib/safety.ts`, so it can't silently drift from the implementation; run it after any change to that file.

## Architecture

```
src/
  app/
    (app)/           # authenticated shell — wrapped by Sidebar in (app)/layout.tsx
    crisis/          # deliberately OUTSIDE the (app) shell; reachable without an account
    onboarding/
  components/
    ui/              # Button, Card, Badge, ProgressRing, Slider, Input
    marketing/       # landing page sections (hero, nav, sections)
    app/              # sidebar, mood-chart, habit-row
  lib/
    types.ts         # domain models — the contract for a future backend
    paths.ts         # the six programmes and their phase structures
    mock-data.ts     # seeded data satisfying those models
    safety.ts        # crisis detection + helplines (read the safety layer section below)
```

### The six paths

`src/lib/paths.ts` defines six genuinely distinct programmes (not one template relabelled) — different lengths, phase structures, and clinical shapes: anxiety (60d, understand→regulate→challenge→exposure), burnout (45d), low mood (60d), sleep (42d, CBT-I), self-esteem (60d), heartbreak (90d). A user picks one at onboarding (`/onboarding`); `/paths` lets them switch or enrol in others. When adding path-related features, don't assume a single 90-day/heartbreak-shaped structure — read a path's `phases` array (in `paths.ts`) rather than hardcoding day counts or phase names.

### Theming and design tokens

Design tokens live in `src/app/globals.css` as Tailwind v4 `@theme` variables plus semantic surface tokens (`--surface`, `--text`, `--border`) that flip under `.dark`. Components should reference the semantic tokens, not raw colors, so theming stays centralized in one file.

Dark mode: the `<html>` class (`dark`) is the single source of truth, set by an inline pre-paint script in `src/app/layout.tsx` (reads `localStorage["healmind-theme"]`) to avoid a light-mode flash before hydration. `src/components/theme-provider.tsx` subscribes to that class via `useSyncExternalStore` rather than mirroring it into React state — don't reintroduce a `useState`/`useEffect` theme mirror.

### Determinism

`mock-data.ts` uses a seeded PRNG (mulberry32), never `Math.random()`. Confetti and healing-tree placements are computed from indices, not randomness. This is required, not stylistic — real randomness on data driving charts/animations produces server/client hydration mismatches. Follow the same pattern for any new generated mock data.

## The crisis safety layer — read before touching `/coach` or `src/lib/safety.ts`

`src/lib/safety.ts` intercepts coach messages indicating crisis. On a match the coach does **not** counsel, reflect, or ask follow-up questions — it states its limits and surfaces helplines. This is a deliberate product decision, not a gap to "improve" toward a friendlier response.

- Detection is **category-routed** across six types: `suicide`, `selfharm`, `harm-others`, `eating`, `abuse`, `substance`. A general mental-health app has a wider risk surface than a breakup-only app, and each category routes to a different specialist helpline.
- **Rule order in `RULES` is significant** — first match wins. `abuse` is checked before `suicide` because "he threatened to kill me" contains a suicide-pattern substring but needs the domestic-abuse line. Preserve ordering intent when adding rules.
- False positives are accepted by design (showing a hotline to someone who didn't need it is low-cost); false negatives are the failure this code exists to prevent. Don't tighten patterns in ways that trade misses for fewer false positives.
- `HELPLINE` numbers are **unverified placeholders** — do not present them as production-ready, and flag it if asked to ship this as-is.
- This is keyword-based and explicitly **not sufficient for production** (misses euphemism/metaphor/misspelling/non-English input; runs client-side so is bypassable). See the file header comment and README for the full pre-production checklist before treating this layer as done.

Always run `npm run test:safety` after editing `safety.ts`.
