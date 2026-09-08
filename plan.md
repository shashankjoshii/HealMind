# HealMind data/state/content architecture plan

Working plan for wiring HealMind's mock-data prototype up to real client-side
state, day-indexed content, SOS tools, and an honest coach. Follow this file
top to bottom; check items off as they land, and keep the "Extra facts" and
"Risks" sections current if new gotchas surface during implementation.

Status legend: `[x]` done, `[ ]` not started, `[~]` in progress.

## Extra facts found during exploration

- `phaseForDay` ([paths.ts:530](src/lib/paths.ts#L530)) falls back to
  `path.phases[0]`, never returns `undefined` — safe to depend on.
- `seeded()` was module-private in `mock-data.ts`; extracted in Phase 0.
- `BreathingPacer` has a latent React bug: `setRounds` is called inside the
  `setPhaseIndex` updater
  ([today/page.tsx:144-148](<src/app/(app)/today/page.tsx#L144-L148>)).
  Updaters must be pure; this survives today but is a Strict Mode /
  double-invoke hazard, and the chained `setTimeout` drifts and gets
  throttled to 1s in background tabs.
- `/dashboard` hardcodes "Trending up" and "Up 11 points since you started"
  (`dashboard/page.tsx:98`, `:175`) and a fabricated "Coach insight" (`:200`).
  `/analytics` hardcodes "lowest days cluster on Sundays" and "missed three
  days" (`analytics/page.tsx:143-144`). True only because
  `generateMoodHistory` is constructed to trend up — false the moment real
  persistence lands.
- `/meditate` says "Narrated by Maya" on 12 cards. No audio files, none
  allowed — biggest honesty problem in the meditation track.
- `/journal` `save()` uses `crypto.randomUUID()` — fine in an event handler,
  fatal if the same pattern reaches store initial state.
- `next.config.ts` has security headers but no CSP. Becomes a real gap once
  journal text lives in localStorage.
- `/journey` HealingTree and `/today` Completion confetti are already
  index-derived and deterministic — no changes needed there.

## Phase 0 — foundations (no visible change) `[x]`

- [x] `src/lib/prng.ts` — extract `seeded()`, add `hashSeed(...parts)`.
- [x] `src/lib/utils.ts` — delete dead `dayToPercent`/`formatDay`; add
      `newId()`, `todayKey()`, `daysBetween()`.
- [x] `src/lib/types.ts` — widen `ChatMessage.suggestions` to `Suggestion[]`;
      document `DailyMission.phase` as a `Phase.key`.
- [x] `src/app/(app)/coach/page.tsx` — updated to match the new
      `Suggestion[]` shape so the build stays green (not in the original
      Phase 0 file list, but required by the type change above).

## Phase 1 — store (needs Phase 0) `[x]`

One zustand store, composed from slices, wrapped in `persist` with
`skipHydration: true`, rehydrated manually from a root-mounted
`<StoreHydrator/>`, with a `useHydrated()` hook built on
`useSyncExternalStore` over `persist.onFinishHydration`. Store's initial state
is the seeded demo state, so server HTML and first client render are
byte-identical by construction.

- [x] `src/lib/store/types.ts` — `AppState`, slice interfaces, `Stored*`
      wrappers, `PersistedState`.
- [x] `src/lib/store/slices/{profile,mood,journal,missions,coach,prefs,sos,meta}.ts`
- [x] `src/lib/store/index.ts` — `createStore` + persist config +
      `useAppStore`.
- [x] `src/lib/store/migrations.ts` — `MIGRATIONS: Record<number, (s: any) => any>`.
- [x] `src/lib/store/seed.ts` — `buildDemoState()`, deterministic, generated
      not literal. Ports `USER` / `generateMoodHistory` / `JOURNAL_ENTRIES`
      from mock-data.ts, clock-relative via an injected anchor date
      (`DEMO_ANCHOR`), re-anchored to real "today" in `rehydrate.ts`.
      **Deviation from the original brief:** `HABITS` was NOT ported into
      the store — there is no `HabitSlice` in `AppState` because no
      persistence/interaction need for habits was specified anywhere in the
      plan (no habit-completion action, no page migration step mentions
      it). `/dashboard`'s habit row stays on the static `HABITS` mock export
      until a real requirement shows up. Also not done: making history
      differ by path (worse `sleepHours` for the sleep path, worse `energy`
      for burnout) — `MOOD_HISTORY` is one global mood timeline regardless
      of active path, matching how `moodEntries` is modeled in
      `store/types.ts` (`Record<date, entry>`, not per-path). Revisit if a
      later phase needs path-specific mood trends.
- [x] `src/lib/store/rehydrate.ts` (new, not in the original file list) —
      `reanchorDemoDates()` and `recomputeStreak()`, run from
      `onRehydrateStorage`. Split out from seed.ts/migrations.ts because
      they're rehydration-time concerns operating on live `AppState`, not
      state generation or version migration.
- [x] `src/lib/store/hydration.ts` — `useHydrated()`, `<StoreHydrator/>`,
      mounted in the root layout beside `ThemeProvider`.
- [x] `src/lib/store/selectors.ts` — `selectMoodHistory`, `selectStreak`,
      `selectProgramme`, `selectTodayEntry`. Full per-render memoization
      (the "selector granularity" risk below) is deferred to Phase 2 when
      `/analytics` actually consumes these.

Verified: `tsc --noEmit`, `npm run lint`, `npm run test:safety`, and
`npm run build` all pass; a Playwright check of `/` and `/dashboard` in dev
found no hydration-mismatch console warnings with `<StoreHydrator/>`
mounted. No page reads from the store yet — that's Phase 2.

Key shapes:

```ts
type SliceCreator<T> = StateCreator<AppState, [["zustand/persist", unknown]], [], T>;
interface AppState extends ProfileSlice, MoodSlice, JournalSlice, MissionSlice,
                            CoachSlice, PrefsSlice, SosSlice, MetaSlice {}

// Per-path progress — /paths already promises this ("progress on every path is kept")
interface ProgrammeState {
  path: PathKey; startedOn: string; currentDay: number;
  completedDays: number[]; completedDates: string[]; // dates drive streak, days drive content
}
interface ProfileSlice {
  profile: { name: string; activePath: PathKey; enrolledPaths: PathKey[];
             xp: number; level: number; streak: number; longestStreak: number; joinedOn: string };
  programmes: Partial<Record<PathKey, ProgrammeState>>;
  enrol(p: PathKey): void; switchPath(p: PathKey): void; awardXp(n: number): void;
}

interface MoodSlice {
  moodEntries: Record<string /* YYYY-MM-DD */, StoredMoodEntry>;  // Record enforces "one per day"
  logMood(entry: MoodEntry): void;   // upsert
}

interface MissionLog {
  path: PathKey; day: number; blockIds: string[];
  startedAt: string; completedAt: string | null;
  responses: Record<string /* MissionStep.id */, string>;
  xpAwarded: number;
}
interface MissionSlice {
  missionLogs: Record<string /* `${path}:${day}` */, MissionLog>;
  startMission(p: PathKey, d: number, blockIds: string[]): void;
  saveStepResponse(p: PathKey, d: number, stepId: string, text: string): void;
  completeMission(p: PathKey, d: number): { xp: number; streak: number; unlocked: Achievement[] };
}
```

`completeMission` returns the deltas — that's what lets `<Completion>` show
real numbers instead of `+120` and `USER.streak + 1`.

### Demo vs real data

The demo is the default state. `buildDemoState()` returns the current
`USER` / 60-day history / journal / habits. A first-time visitor sees a full,
charted app; server and client agree; nothing flashes empty.

Marking: don't pollute `types.ts`. Add store-layer wrappers in
`store/types.ts`:

```ts
export interface StoredMoodEntry extends MoodEntry { seeded?: true }
export interface StoredJournalEntry extends JournalEntry { seeded?: true }
```

Selectors strip `seeded` before handing arrays to `mood-chart.tsx`, so chart
components need zero changes. Root flag `demoMode: boolean` drives a
dismissible "you're viewing sample data" banner.

Do not fabricate history for a real user. On onboarding completion, clear
all seeded records and write exactly one real entry — today's, derived from
the intake sliders. Charts get honest low-data empty states ("three more
check-ins and the trend line appears"). Settings keeps "Load sample data" /
"Clear everything" for evaluation and screenshots.

### `currentDay` semantics — a real product decision

`currentDay = min(totalDays, completedDays.length + 1)` — progress-based,
not calendar-based. Someone returning after two weeks should not be dumped
on day 40 with content they never saw; the app's own copy says "the
programme doesn't reset" (`journey/page.tsx:180`). Calendar dates are used
only for streak. Consequence: no "missed" days mid-phase, so `/journey`'s
missed-day styling and copy become "not yet done".

### persist config

```ts
{ name: "healmind-state",            // distinct from "healmind-theme"
  version: 1,
  storage: createJSONStorage(() => localStorage),
  skipHydration: true,
  partialize: s => ({ profile, programmes, moodEntries, journalEntries, missionLogs,
                      conversation, coachMemory, prefs, sosHistory, demoMode, onboardedAt }),
  migrate: (persisted, from) => runMigrations(persisted, from),
  onRehydrateStorage: () => (state, err) => { if (err) return; recomputeStreak(state); reanchorDemoDates(state); } }
```

`sosOpen` / `sosTool` excluded — transient UI. Ship `version: 1` from day one
with the migration chain in place. If `migrate` throws, return
`buildDemoState()` with `demoMode: true` rather than white-screening;
corrupt localStorage must not brick the app.

Theme stays out of the store, with an explicit comment in `prefs.ts` pointing
at `src/components/theme-provider.tsx` and CLAUDE.md's theming section.

## Phase 2 — page migration (needs Phase 1) `[x]`

Smallest blast radius first.

- [x] `/paths` — `switchPath` + per-path progress. Proves the store
      end-to-end and fixes the most obvious lie. Verified live with
      Playwright: clicking "Start this path" enrols + activates correctly,
      already-enrolled paths keep real `currentDay`/`totalDays`, no console
      errors.
- [x] `/mood` — `logMood` (upsert by date, one entry per day), real
      history, real "day N" count, low-data-safe averages (`n === 0` guard).
      **Found and fixed a real bug while wiring this up** — see the new
      "selector granularity" note under Risks below; `selectors.ts` was
      restructured because of it (raw-slice selectors vs. pure `derive*`
      functions memoized in the component).
- [x] `/journal` — swapped `useState(JOURNAL_ENTRIES)` for the store's
      `journalEntries` + `addEntry`, same `deriveX`-in-`useMemo` pattern as
      `/mood`. Verified live: composing and saving a new entry increments
      the count and appears in the list, no console errors.
- [x] `/settings` — wired to `prefsSlice` (notifications + privacy
      toggles), `profile`/`programmes` for the account card, working Export
      (`Blob` + `createObjectURL` of `exportJson()` — verified a real
      download fires), Delete (confirm → `clearEverything()` →
      `router.push("/onboarding")` — verified), and added a "Load sample
      data" button calling `loadSampleData()` (the plan's demo-vs-real-data
      section calls for this control but it wasn't in the Phase 2 file
      list or the original settings UI — added since the action already
      existed in `MetaSlice` with no way to trigger it).
      **Found and fixed two more real bugs here** — see the two new
      "rehydration" notes under Risks below: `profile.joinedOn` wasn't
      being re-anchored at all (showed "Joined June 2026" instead of the
      correct month), and the re-anchoring math would have double-shifted
      demo dates further forward on every single app reopen. Both fixed via
      a new persisted `demoAnchor` field (`MetaSlice`) that tracks the last
      date the demo content was shifted to, so `reanchorDemoDates()` shifts
      incrementally from there instead of from the fixed `DEMO_ANCHOR`
      constant every time.
- [x] `/dashboard` + `/analytics` — split into `page.tsx` (server,
      `export const metadata` only) + `dashboard-client.tsx` /
      `analytics-client.tsx` ("use client"), both now reading real
      `profile`/`programmes`/`achievements`/`moodEntries` from the store.
      **Deviation from the brief:** the honesty-debt strings were NOT left
      wired to `deriveInsights`, because that module is Phase 5 and doesn't
      exist yet. Rather than leave them hardcoded-and-now-provably-false
      once real data flows through (the exact failure this phase exists to
      prevent), each was replaced with something honestly computed from
      data already in the store today — a smaller, self-contained version
      of what Phase 5 will formalize and replace outright:
      - `UserProfile.wellbeingScore` doesn't exist in `ProfileSlice` (never
        had a real formula — see the "no HabitSlice"-style note in Phase 1).
        Added `averageMoodScore()` to `store/selectors.ts` (mood score
        over a window, scaled to 0–100) as an honest interim stand-in, used
        by both pages. Phase 5's real composite formula replaces this, not
        adds to it.
      - Dashboard's hardcoded "Trending up" badge and "Up 11 points since
        you started" → a real two-half-window comparison
        (`trendLabel()`, dashboard-local) that can say "Trending down" or
        "Holding steady" too.
      - Dashboard's fabricated "Coach insight" (the movement/anxiety
        correlation claim) → an honest statement using the same real trend
        computation, explicit that deeper pattern-finding is still coming
        rather than pretending to have already found one.
      - Analytics' "You've missed three days... Recovery from a lapse
        predicts outcomes" → this claim is now **categorically inapplicable**,
        not just wrong-numbered: under the progress-based `currentDay`
        model (`completedDays.length + 1`), `completedDays.length` and
        `currentDay - 1` are the same number by construction, so there is
        no such thing as a "missed day" left to count — see the
        `currentDay` semantics note in Phase 1. The whole "Completion
        rate" card was reframed as "Programme progress"
        (`completedDays`/`path.totalDays`, i.e. progress through the whole
        programme) since the original metric's premise no longer exists.
      - Analytics' "Your lowest days cluster on Sundays" → an actual
        groupby-average over real history (`lowestAverageWeekday()`,
        analytics-local — plain arithmetic, no correlation/ML), only
        stated when there are ≥2 samples for the lowest weekday; omitted
        otherwise rather than guessed.
      - Analytics' "That single change explains a lot of the mood
        improvement" and "usually happens around week five" → dropped (both
        were unsubstantiated causal/timing claims layered on top of real
        numbers); the real percentages stayed.
      - `/analytics` also gets a real low-data empty state (`history.length
        === 0`) instead of computing `NaN` out of an empty array.
      Verified live: both pages render real numbers, no fabricated strings
      remain (`"missed three"` / `"cluster on Sundays"` checked absent),
      no console errors.
- [x] `sidebar.tsx` — store-backed (`profile`, `programmes`), demo profile
      pre-hydration (initial state = demo state, so this is safe to read
      directly without a hydration guard).
- [x] `/onboarding` — `completeOnboarding({ path, today })` → `/dashboard`.
      The five intake sliders don't map 1:1 onto `MoodEntry` (no
      `sleepHours` question was ever asked; the "Calm" slider is inverted
      relative to `MoodEntry.anxiety`) — `deriveTodayMoodEntry()` in
      `onboarding/page.tsx` does a documented best-effort conversion rather
      than inventing a number. Verified live end-to-end: pick a path →
      answer all 6 questions → result screen → "Start day 1" clears the
      demo state, enrols the chosen path at day 1, and lands on
      `/dashboard` showing it correctly.
- [x] `/journey` — real `completedDays`/`currentDay`/`achievements`,
      retired "missed" wording on the day grid ("not yet done" — a past,
      incomplete day is styled/labelled as available, not penalised).
      Achievement flavor text like "Still Here — Returned after a missed
      day" was left alone; that's the calendar/streak sense of "missed"
      (still a real concept via `completedDates`/streak), not the
      day-grid content-progress sense the plan calls out for retirement.
      **Found and fixed a third real bug here** — see the new
      "currentDay must never regress" note under Risks: `completeMission`'s
      `currentDay = completedDays.length + 1` formula would have walked
      the demo profile's day backwards (26 → 24) the first time its
      seeded historical gap days (7, 16, 17) were fed through it.

Server components: convert `/dashboard` and `/analytics` to `page.tsx`
(server, `export const metadata` only) + `dashboard-client.tsx` /
`analytics-client.tsx` (`"use client"`). They render nothing but user-owned
data, so SSR buys nothing and risks everything. `/`, `/crisis` and both
layouts stay server.

## Phase 3 — content (needs Phase 0; runs parallel with Phase 2) `[ ]`

### Pressure-testing the "no repeats" hypothesis

The composable block library is right in shape but wrong in one premise:
"avoiding repeats within a rolling window" is both infeasible and clinically
wrong. A 16-day phase at 3.5 steps is 56 step slots; a strict no-repeat rule
needs ≥56 blocks for that phase alone (~1250 blocks total). And the app's own
content contradicts it — anxiety's expose phase says "One rung a week,
repeated until it's dull" (`paths.ts:87`), CBT-I's whole mechanism is holding
the same wake time nightly. A never-repeating system is worse therapy.

**Approach: "spine + composer."** Per phase, author a repeating core
practice + an ordered 4-step progression track derived from the phase's
existing `activities` bullets, then let a seeded composer deal rotation
blocks from shuffled per-path and shared pools. Repetition becomes an
explicit, surfaced feature ("Paced breathing · day 9 of this practice")
rather than a content bug.

Authoring budget:

| Category | Count | Source |
|---|---|---|
| Progression blocks | 100 | 1:1 expansion of existing `Phase.activities` bullets (4 × 25 phases) |
| Core practices | 25 | one per phase — the deliberate repeat |
| Shared rotation pool | ~50 | breathing / grounding / gratitude / somatic / self-compassion, paths unset = all |
| Path-flavoured rotation | ~30 | 5 per path |
| **Total** | **~205 blocks** | plus 2-4 prompt variants each |

Minimum viable pool per phase must be ≥6 eligible rotation blocks — asserted
by `test:content`.

- [ ] `src/lib/content/types.ts` — `ExerciseBlock`, `BlockTag`, `BlockRole`.
- [ ] `src/lib/content/blocks/shared.ts` — ~50 cross-path blocks.
- [ ] `src/lib/content/blocks/{anxiety,burnout,lowmood,sleep,selfesteem,heartbreak}.ts`
- [ ] `src/lib/content/blocks/index.ts` — `ALL_BLOCKS`, `BLOCK_BY_ID`, pools
      indexed by path/phase.
- [ ] `src/lib/content/phase-content.ts` — `${PathKey}:${phaseKey} -> { core, coreCadence, track, titles }`.
- [ ] `src/lib/content/titles.ts` — mission title/intention variants per
      phase.
- [ ] `src/lib/content/compose.ts` — `missionForDay` + helpers.
- [ ] `src/lib/content/meditations.ts` — `MeditationScript` cue lists
      (see Phase 4).
- [ ] `scripts/content-check.mjs` + `npm run test:content` — write **before**
      authoring paths 2-6.

Deliberately not in `mock-data.ts` — this is product content, not mock data.
`paths.ts` stays structural/visual and does not balloon.

Schema:

```ts
export type BlockRole = "core" | "progression" | "rotation" | "closer";

export interface ExerciseBlock {
  id: string;                  // stable kebab, e.g. "anx-reg-paced-breathing"
  kind: MissionKind;
  role: BlockRole;
  title: string;
  description: string;
  prompts?: string[];          // rotating variants; absent = no textarea
  duration: number;            // minutes
  paths?: PathKey[];           // omit = all
  phases?: string[];           // `${PathKey}:${phaseKey}`, or bare phaseKey for shared
  tags?: BlockTag[];           // "grounding" | "sleep" | "activation" | "exposure" | ...
  order?: number;              // position within a progression track
  notFirst?: boolean;          // heavy CBT shouldn't open a session
  widget?: "breathing" | "timer" | "grounding-54321" | "ladder" | "sleep-log" | "activity-picker";
}
```

`widget` is load-bearing: turns the mission runner from "read text, type in a
box" into actual tools, and is how SOS tools get reused inside missions.

Composer:

```ts
export interface ComposeOptions {
  targetMinutes?: number;                  // default 15
  intensity?: "light" | "standard";        // "light" = ~6 min, core + closer only
  variant?: number;                        // for a "give me a different one" button
}
export function missionForDay(path: Path, day: number, o?: ComposeOptions): DailyMission;
export function missionForPathKey(key: PathKey, day: number, o?: ComposeOptions): DailyMission;
```

Takes `Path`, not `PathKey`, to mirror `phaseForDay(path, day)` and enforce
"read the path's phases array".

Algorithm:

1. `phase = phaseForDay(path, clamp(day, 1, path.totalDays))`;
   `dayInPhase = day - phase.startDay`;
   `phaseLength = phase.endDay - phase.startDay + 1`.
2. `rand = seeded(hashSeed(path.key, day, variant ?? 0))` — FNV-1a string
   hash into the existing mulberry32 (both now in `src/lib/prng.ts`).
3. **Core**: include per `coreCadence` (`everyDay` | `fiveInSeven` |
   `weekly`), decided by `dayInPhase % 7`.
4. **Progression**: `idx = clamp(floor(dayInPhase / phaseLength * track.length), 0, track.length-1)`
   — each activity-derived block owns a quarter of the phase. Prompt
   variant = `dayInPhase % prompts.length`.
5. **Rotation** — "shuffle the deck, deal, reshuffle when exhausted":
   `cycle = floor(dayIndex * n / pool.length)`; deterministically
   Fisher–Yates the pool seeded on `hashSeed(path.key, phase.key, cycle)`;
   take this day's slice. O(1), no recursion over prior days, guarantees
   full coverage before any repeat, reshuffling per cycle hides a fixed
   order.
6. **Kind-mix guard**: assert ≥1 of {breathing, somatic, meditation} and ≥1
   of {cbt, reflection, journal}; if missing, swap the lowest-priority
   rotation pick for the nearest eligible block of the missing kind
   (deterministic rule).
7. **Order**: regulate → cognitive → behavioural → closer; honour
   `notFirst`.
8. Trim lowest-priority rotation picks while
   `sum(duration) > targetMinutes + 3`.
9. Title/intention from `titles.ts` keyed `${path.key}:${phase.key}`,
   variant from `rand()`.

`MissionStep.id` must be block-derived and stable forever (`blockId`, or
`${blockId}#${i}` if a block legitimately repeats within a day) — never
index- or random-derived, because `MissionLog.responses` is keyed by it
across sessions.

`DailyMission.phase`: fix, don't remove. The composer sets it from
`phaseForDay`, so it's correct by construction (kills the heartbreak day-34
selfcare/acceptance bug). Keep the field — it's part of the documented
backend seam (now with a tightened doc comment from Phase 0), and `/today`
currently recomputes `phaseForDay` itself
([today/page.tsx:23](<src/app/(app)/today/page.tsx#L23>)) — after this it
just reads `mission.phase`.

`scripts/content-check.mjs` (modelled on `scripts/safety-check.mjs`) asserts,
over all 357 `(path, day)` pairs:

- 2-5 steps; step ids unique within a mission; `estimatedMinutes === Σ durations`.
- every referenced block id exists; every `phases` tag names a real
  `${PathKey}:${phaseKey}`.
- calling twice is deep-equal (determinism).
- no phase's eligible rotation pool is below 6.
- coverage: every authored block is reachable by at least one day (catches
  typo'd tags that silently shrink a pool).

Remaining sub-steps once the anxiety path proves the pipeline:

- [ ] Author the remaining five paths (burnout, lowmood, sleep, selfesteem,
      heartbreak). Long pole, parallelisable, independent of everything
      else.
- [ ] Wire `/today` to `missionForDay`; persist responses; real
      `<Completion>` numbers. Delete `MISSIONS_BY_PATH` and `TODAY_MISSION`.
- [ ] `/dashboard` mission tile reads the composed mission (needs Phase 2
      step 5 + this).

## Phase 4 — SOS + timers (needs Phase 1 for the slice; independent of Phase 3) `[ ]`

Mount `<CalmNow/>` in the root layout (`src/app/layout.tsx`) inside
`<ThemeProvider>`; it renders only a FAB + a global hotkey and lazily
`next/dynamic`-imports the panel with `{ ssr: false }` on first open. Panel
state lives in a non-persisted `SosSlice`, not a context. The root layout is
the only common ancestor of `(app)`, `/crisis`, `/onboarding` and the
marketing site — exactly where a distressed first-time visitor lands.

- [ ] `src/components/sos/calm-now.tsx` — root-mounted FAB + hotkey +
      `<dialog>` shell.
- [ ] `src/components/sos/calm-now-panel.tsx` — tool picker + tool host
      (dynamic, `ssr:false`).
- [ ] `src/components/sos/tools/{breathing-tool,grounding-54321,body-scan,panic-first-aid}.tsx`
- [ ] `src/components/breath/breath-pacer.tsx` — extracted, generalised
      pacer.
- [ ] `src/components/breath/patterns.ts` — `BREATH_PATTERNS`.
- [ ] `src/lib/timers/use-interval-timer.ts` — rAF + `performance.now()`,
      drift-corrected.
- [ ] `src/lib/timers/use-audio-engine.ts` — Web Audio ambience,
      gesture-gated.

### Opening

- Floating button, fixed bottom-right, every route except `/crisis` (you're
  already there; it would compete).
- Hotkey `Alt+C` — Alt-modified keys don't emit into text inputs, collides
  with no browser/OS shortcut. Cmd/Ctrl+K is reserved by convention for
  search; a bare letter would fire while typing a journal entry.
- A sidebar nav item for discoverability.
- Skip `useSearchParams` deep links — forces a `<Suspense>` boundary or opts
  the tree into client rendering, not worth it. Cross-page invocation goes
  through the store action instead (`openSos("box")`), which is what the
  coach chips dispatch (see Phase 0's `Suggestion` type).

State:

```ts
interface SosSlice {                       // sosOpen/sosTool excluded from partialize
  sosOpen: boolean; sosTool: SosToolKey | null; sosStartedAt: string | null;
  sosHistory: { at: string; tool: SosToolKey; seconds: number; helped: boolean | null }[]; // persisted, FIFO cap 200
  openSos(tool?: SosToolKey): void;
  closeSos(outcome?: { seconds: number; helped: boolean | null }): void;
}
```

`sosHistory` feeds analytics ("you've used Calm Now six times this week,
mostly around 11pm") and the adaptive router ("the physiological sigh is the
one that works for you"). Use a native `<dialog>` + `showModal()`: focus
trap, Esc, and background inerting for free.

### Extracting `BreathingPacer` — yes

```ts
export interface BreathPhase { label: string; seconds: number; scale: number }
export interface BreathPattern {
  key: "box" | "478" | "sigh" | "coherent"; name: string; description: string;
  phases: BreathPhase[]; recommendedRounds: number;
}
export function BreathPacer(props: {
  pattern: BreathPattern | BreathPattern["key"];
  autoStart?: boolean; rounds?: number; size?: "sm" | "md" | "lg";
  showControls?: boolean; sound?: boolean;
  onRoundComplete?(round: number): void;
  onFinish?(rounds: number, seconds: number): void;
}): JSX.Element;
```

The existing component already iterates `PHASES.length` generically, so a
3-phase physiological sigh (2 in / 1 top-up / 6 out) and 3-stage 4-7-8 drop
straight in.

Fix the impure-updater bug during extraction (see "Extra facts"): replace
the chained `setTimeout` with `useIntervalTimer` (rAF + `performance.now()`),
deriving `phaseIndex` and `round` from monotonic elapsed time. Makes the
updater pure, eliminates drift, survives background-tab throttling, makes
pause/resume trivial.

Reduced motion: when `useReducedMotion()` is true, drop the scale animation
entirely and show a linear progress bar plus an `aria-live="polite"` phase
announcement.

`/today` then renders `<BreathPacer pattern={...} />` driven by the block's
`widget`/`tags`.

### Meditation audio

**Web Audio synthesis, opt-in, default OFF**, with a silent visual-timer +
on-screen script that is fully functional on its own. Filtered noise
(lowpass ~800Hz with a slow LFO on cutoff) reads as rain, two detuned sines
make a drone, sparse triangle bursts through a long decay make chimes —
~150 lines, zero asset bytes. Synthesis cannot produce narration, and
`Meditation.narrator` currently promises exactly that on 12 cards.

```ts
export interface MeditationCue { atSeconds: number; text: string }
export interface MeditationScript {
  id: string; cues: MeditationCue[];
  ambience: AmbienceKey | null; breathPattern?: BreathPattern["key"];
}
export type AmbienceKey = "rain" | "ocean" | "drone" | "chimes" | "brown-noise";
export function useAudioEngine(): {
  ready: boolean;
  start(k: AmbienceKey, o?: { volume?: number; fadeInMs?: number }): Promise<void>;
  stop(fadeOutMs?: number): void;
  setVolume(v: number): void;
};
```

12 sessions × ~10 cues = 120 lines of authoring. Drop "Narrated by X" from
the card, replace with "Guided by on-screen text + ambient sound".

Audio rules (all real failure modes):

- Create the `AudioContext` inside the click handler, never at module scope
  or in an effect, and `resume()` on the same gesture. Otherwise it lands in
  `suspended` state — a silent player with no error.
- One module-level singleton context per page. Safari caps and leaks them.
- Always ramp gain (`linearRampToValueAtTime`). Abrupt `stop()` produces an
  audible click — the opposite of calming.
- Cleanup: fade out, then `disconnect()` all tracked nodes and `stop()`
  oscillators. Only `ctx.close()` when leaving the feature.
- Keep playing on `visibilitychange` — timer is time-based, self-corrects.
- `prefers-reduced-motion` does not imply reduced sound. Sound defaults to
  off, lives in `PrefsSlice.sound`, toggled in the player. Never autoplay.
- The SOS panel gets no audio at all by default.

### The six tools

Physiological sigh first (fastest actual relief, ~60s), then box, 4-7-8,
5-4-3-2-1 grounding (tap-through, no typing — typing is hard when panicking),
body scan (60/120/300s), panic first-aid (scripted: "this is a panic attack,
it peaks in ~10 minutes and it passes" → orient → sigh → temperature → one
next sentence).

Every tool ends with "I feel a bit better" / "still not okay", and "still
not okay" routes to `/crisis`. This is an explicit user action with no free
text, so it does not invoke `detectCrisisCategory`. Keep all `safety.ts`
usage confined to `/coach` so `test:safety`'s surface stays exactly as-is.

## Phase 5 — adaptive routing + the coach (needs Phases 1, 3, 4) `[ ]`

### Adaptive routing

One deterministic, ordered rules engine in `src/lib/adaptive/recommend.ts`
that returns ranked recommendations, each carrying a human-readable `reason`
string that is displayed.

- [ ] `src/lib/adaptive/recommend.ts`
- [ ] `/dashboard` feeling strip + `/today` light mode.

```ts
export type FeelingKey = "panicky"|"low"|"numb"|"wired"|"exhausted"|"sad"|"angry"|"cant-sleep"|"okay";

export interface FeelingSignal {
  feeling?: FeelingKey; mood?: MoodKey;
  metrics?: Pick<MoodEntry, "energy"|"stress"|"anxiety"|"confidence"|"sleepQuality">;
  hourOfDay: number;                 // PASSED IN, never read inside — hydration
  path: PathKey; day: number; streak: number; missedYesterday: boolean;
  recentSos: { tool: SosToolKey; helped: boolean | null }[];
}
export interface Recommendation {
  id: string;
  kind: "sos"|"mission"|"mission-light"|"meditation"|"journal"|"coach"|"breath"|"crisis";
  href?: string;
  action?: { type: "openSos"; tool: SosToolKey } | { type: "startMission"; intensity: "light"|"standard" };
  title: string; reason: string; weight: number;
}
export function recommend(signal: FeelingSignal, limit = 3): Recommendation[];
```

Rules, ordered, in the same legible style as `safety.ts`'s `RULES`:

1. `panicky` or `anxiety >= 8` → physiological sigh, then grounding, then
   mission-light. Never lead with a 16-minute mission.
2. `hour >= 22 && (cant-sleep || path === "sleep")` → body scan + the "3am
   toolkit" session, suppress the daily mission.
3. `numb` → a behavioural-activation micro-action, not journaling.
4. `exhausted || energy <= 3` → mission-light (`intensity: "light"`).
5. `missedYesterday && streak === 0` → non-punitive "return" card with the
   3-minute version.
6. default → today's mission.

Surfaces: a 6-chip "How are you right now?" strip at the top of `/dashboard`;
the "what next" step after any SOS tool; an "I don't have it in me today →
3-minute version" affordance on `/today`.

Also fix the `/crisis` routing gap: `GROUPS` in
`src/app/crisis/page.tsx` covers only suicide, eating, abuse.

- [ ] Add sections for `selfharm`, `substance`, `harm-others`.
- [ ] Extend `scripts/safety-check.mjs` with an assertion that
      `CrisisCategory ⊆ GROUPS[].category` and every category has ≥1
      helpline. Pure addition — touches no regex, `test:safety` keeps
      passing.

### The coach — and its ceiling, stated plainly

**Ceiling**: without an LLM this is a scripted expert system. It can be a
very good one — a guided self-help worksheet with real branching — but it
cannot understand novel input and must not pretend to. The single largest
quality win is reframing it as a guided conversation rather than an AI that
listens: rename the sidebar item and heading from "AI coach" to "Coach", and
add one sentence to the existing disclosure box
(`coach/page.tsx:148-155`): "Replies are written in advance by our team and
matched to what you say — this is not a large language model, and it won't
understand everything."

- [ ] `src/lib/coach/intents.ts` — ~20 intents × 10-15 weighted keywords.
- [ ] `src/lib/coach/classify.ts` — `classifyIntent(text, memory) -> { intent, confidence, secondary }`.
- [ ] `src/lib/coach/flows.ts` — thought-record, activation-ladder,
      sleep-triage, boundary-script, worry-postponement,
      self-compassion-reframe.
- [ ] `src/lib/coach/library.ts` — ~60-80 templates with `{placeholders}`.
- [ ] `src/lib/coach/context.ts` — `buildCoachContext(state) -> { name, path, day, streak, todayMood, trends, lastSos }`.
- [ ] `src/lib/coach/respond.ts` — `coachRespond(input, memory, context) -> { message, memory }`.
- [ ] `src/lib/insights.ts` — `deriveInsights(history, missionLogs, sosHistory): Insight[]`, computing trends
      instead of asserting them, explicit low-data state below ~10 entries.
      Feeds the coach, `/dashboard`'s "Coach insight" tile, and
      `/analytics`'s bullet list.
- [ ] Rename "AI coach" → "Coach" + disclosure sentence above.
- [ ] `/coach` rewrite with typed `Suggestion` payloads (needs Phase 4, so
      "let's breathe" has something to open).

Three concrete fixes:

**(a) Scoring beats first-match.** `REPLIES.find()` (`coach/page.tsx:59`)
returns the first array element that matches, so "work is exhausting and I
can't sleep" always resolves to the work reply regardless of emphasis,
because order — not relevance — decides. A Σ(weighted keyword) argmax with a
confidence threshold handles multi-topic input and can acknowledge both.

**(b) Suggestion chips carry payloads.** Already partly landed in Phase 0:
`Suggestion.payload` is a discriminated union. This phase adds the `intent`
and `flow` variants and the real `openSos` action type once `SosToolKey`
exists:

```ts
export interface Suggestion {
  label: string;
  payload: { type: "intent"; intent: IntentKey }
         | { type: "flow"; flow: FlowKey; step?: number }
         | { type: "action"; action: "openSos"; tool: SosToolKey }
         | { type: "message"; text: string }
         | { type: "navigate"; href: string };
}
```

"Yes, let's breathe" dispatches `openSos("box")` — depends on the SOS work
landing first.

**(c) Conversation state, persisted.**

```ts
interface CoachMemory {
  lastIntent: IntentKey | null; intentCounts: Partial<Record<IntentKey, number>>;
  pendingFlow: FlowKey | null; flowStep: number; flowData: Record<string, string>;
  turnCount: number; usedTemplateIds: string[];
}
```

- No template repeats within a session.
- Same intent 3× → escalate: "we keep coming back to sleep — want to
  actually work through it?" → offers sleep-triage.
- `turnCount > ~12` → steer toward an action rather than looping.
- While `pendingFlow` is set, free text is captured as flow data instead of
  being reclassified — this is what makes the thought record actually work
  (situation → thought → evidence for → evidence against → balanced thought
  → "save this to your journal" via `journalSlice.addEntry()`).

Safety is untouched. `send()` keeps calling `detectCrisisCategory(trimmed)`
first and short-circuiting before classification and flow handling. One
addition: a crisis match must also clear `pendingFlow`, so the user isn't
dropped back into a thought record on their next message. **Do not edit
`safety.ts`.**

## Implementation order (summary)

1. Phase 0 — foundations. `[x]`
2. Phase 1 — store (needs 0).
3. Phase 2 — page migration (needs 1, smallest blast radius first).
4. Phase 3 — content (needs 0; runs parallel with 2).
5. Phase 4 — SOS + timers (needs 1 for the slice; independent of 3).
6. Phase 5 — adaptive + coach (needs 1, 3, 4).

## Risks and gotchas

- **Hydration is the #1 risk.** Invariant: server HTML and the first client
  render both come from `buildDemoState()`. Never read `localStorage`,
  `Date.now()`, `crypto.randomUUID()` or `window` during render.
- `new Date()` at module scope — `mock-data.ts:73` pins 2026-08-03. Making
  history clock-relative means the server (UTC on Vercel) and the client
  (local TZ) can disagree about "today" across midnight. Fix: demo dates use
  a fixed anchor for the server render, then re-anchor to real today inside
  `onRehydrateStorage`. Subtlest bug in the plan — **and it bit twice** in
  practice while building Phase 1/2, both now fixed in `seed.ts` /
  `rehydrate.ts`:
  - `reanchorDemoDates()` originally computed its shift as
    `today - DEMO_ANCHOR` (the fixed constant) on every single
    rehydration. Since the shifted dates get persisted, reopening the app
    on day 2 would shift the already-shifted dates by the day-2 offset
    *again*, compounding forever. Fixed by adding a persisted
    `demoAnchor: string` (`MetaSlice`) that records the last date the
    content was shifted to; the shift is now `today - state.demoAnchor`,
    which is idempotent across sessions.
  - `reanchorDemoDates()` shifted `moodEntries`, `journalEntries` and
    `programmes` but not `profile.joinedOn` — caught live via Playwright,
    where `/settings` showed "Joined June 2026" (the raw
    `DEMO_ANCHOR`-relative value) instead of shifting forward with
    everything else. Now included in the same reanchor patch.
  - Relatedly: `loadSampleData()` and the corrupt-localStorage recovery
    path in `onRehydrateStorage` both call `buildDemoState(...)` live,
    well after mount — unlike the store's *initial* state (which must stay
    pinned to the fixed `DEMO_ANCHOR` for the SSR/hydration invariant),
    these two call sites now pass `new Date()` so the content they
    generate is anchored to real "today" immediately rather than waiting
    for the next reanchor.
- `crypto.randomUUID` in store initial state — never. Seed ids must be
  literals (`"j1"`, `"seed-mood-0"`).
- zustand v5 + React 19: object-returning selectors need `useShallow` from
  `zustand/react/shallow`. v5 dropped v4's `useStore(selector, shallow)`
  overload, so a selector returning a fresh object causes an infinite
  re-render loop. Flag it in the store file header.
  **Confirmed live during Phase 2** — `useAppStore(selectMoodHistory)`
  where `selectMoodHistory` did `Object.values(...).map(...).sort(...)`
  infinite-looped on `/mood` ("Maximum update depth exceeded" /
  "getServerSnapshot should be cached"). `useShallow` alone would NOT have
  fixed this case either, because the derived array's *elements* are also
  new objects each call (from `stripSeeded`'s spread) — shallow element
  comparison still sees everything as changed. The actual fix:
  `store/selectors.ts` only exports (a) raw-slice selectors that return a
  reference already stable in the store (`selectMoodEntries`, i.e.
  `state.moodEntries` itself — replaced only on real mutation) and (b) pure
  `derive*` functions (`deriveMoodHistory`, `deriveTodayEntry`) that
  components call inside their own `useMemo`, keyed on that stable slice.
  Never ship a selector that both derives AND is passed straight to
  `useAppStore()` — always split derivation out into a memoized step in the
  component.
- Selector granularity — `/analytics` renders three 60-point recharts trees;
  select the array once through a memoised selector, never the whole state
  object.
- localStorage quota — journal + conversation + 357 mission response sets
  can run to hundreds of KB. Cap conversation at ~100 messages FIFO and
  `sosHistory` at 200. Wrap `setItem` in try/catch — Safari private mode
  throws, `QuotaExceededError` must degrade to in-memory, not crash.
- Privacy — journal text in localStorage is plaintext, readable by any
  script on the origin. `next.config.ts` has no CSP — add one as part of
  this work. "Require unlock for journal" must not be presented as
  encryption.
- Composer purity — no `Math.random()`, no `Date.now()`, every sort needs an
  explicit id tiebreaker so ordering is total.
- Step-id stability — renaming a block orphans saved responses. Store
  `MissionLog.blockIds` so an old log still renders even after the pool
  changes.
- `currentDay` must never regress, even though it's derived from
  `completedDays.length + 1`. **Confirmed live during Phase 2**: the demo
  seed (`seed.ts`) intentionally gives the anxiety programme 3 historical
  gap days (7, 16, 17 — "a perfect streak reads as fake", carried over from
  the original mock data) while `currentDay` is seeded at 26, so
  `completedDays.length` (22) is less than `currentDay - 1` (25) from the
  start. The first time `completeMission` ran against that seed, the naive
  formula computed `23`, regressing the visible day from 26 to 23. Fixed in
  `missions.ts` by taking `Math.max(programme.currentDay, completedDays.length + 1)`
  instead — `currentDay` only ever advances, regardless of how
  `completedDays` was populated (seeded history, a future backend import,
  a migration, etc).
- `test:safety` must stay green. `scripts/safety-check.mjs` parses the
  `RULES` regex literals out of `safety.ts` textually — do not reformat that
  array, do not move `RULES`, do not introduce computed patterns. The coach
  refactor imports from `safety.ts` and leaves the file byte-identical.
- `AudioContext` autoplay policy — created outside a user gesture →
  suspended, i.e. a silent player with no error thrown. Always create-on-click
  and check `ctx.state`.
- `<dialog>` + framer-motion — `close()` removes the element before an exit
  animation can run. Animate the contents with `AnimatePresence` and call
  `close()` in `onExitComplete`, or drop the exit animation.
- Content-tag drift — a typo in a `phases` tag silently shrinks a pool with
  no error. The "every block reachable" and "no pool below 6" assertions in
  `test:content` are the only guardrail.
- **Honesty debt** — four strings must change or the app makes false claims
  once data is real: `/analytics`'s hardcoded insight bullets,
  `/dashboard`'s "Trending up" badge and "Up 11 points since you started",
  `/meditate`'s "Narrated by X", and the coach's "AI" framing. `/community`
  is 100% fabricated social proof and deserves the same treatment
  (flagging, out of scope for this plan).

## Critical files for implementation

- `src/lib/mock-data.ts`
- `src/lib/types.ts`
- `src/lib/paths.ts`
- `src/app/(app)/today/page.tsx`
- `src/app/(app)/coach/page.tsx`
