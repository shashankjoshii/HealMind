import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, Flame, Lightbulb, NotebookPen, Quote, Sparkles, Wind,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar, ProgressRing } from "@/components/ui/progress-ring";
import { MoodTrendChart } from "@/components/app/mood-chart";
import {
  ACHIEVEMENTS, AFFIRMATIONS, DAILY_QUOTE, MOOD_BY_KEY, MOOD_HISTORY,
  TODAY_MISSION, USER, phaseForDay,
} from "@/lib/mock-data";
import { dayToPercent } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const phase = phaseForDay(USER.currentDay);
  const recent = MOOD_HISTORY.slice(-14);
  const latest = MOOD_HISTORY[MOOD_HISTORY.length - 1];
  const latestMood = MOOD_BY_KEY[latest.mood];
  const unlocked = ACHIEVEMENTS.filter((a) => a.unlockedOn !== null);
  const affirmation = AFFIRMATIONS[USER.currentDay % AFFIRMATIONS.length];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <header>
        <p className="text-sm font-semibold text-brand-600 dark:text-brand-300">
          Day {USER.currentDay} of 90 · {phase.name}
        </p>
        <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Good morning, {USER.name}
        </h1>
        <p className="mt-2 text-muted">{phase.tagline}. Let&rsquo;s take today gently.</p>
      </header>

      {/* Top row: progress ring + today's mission */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_1.6fr]">
        <Card className="flex flex-col items-center p-8 text-center">
          <ProgressRing value={dayToPercent(USER.currentDay)} label="Recovery progress">
            <div>
              <p className="text-4xl font-extrabold tracking-tight">
                {USER.recoveryScore}
              </p>
              <p className="text-xs font-semibold text-subtle">Recovery score</p>
            </div>
          </ProgressRing>

          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[var(--surface-muted)] p-3">
              <p className="flex items-center justify-center gap-1.5 text-2xl font-extrabold">
                <Flame className="h-5 w-5 text-warm-400" />
                {USER.streak}
              </p>
              <p className="mt-0.5 text-xs text-subtle">Day streak</p>
            </div>
            <div className="rounded-2xl bg-[var(--surface-muted)] p-3">
              <p className="text-2xl font-extrabold">{USER.completedDays.length}</p>
              <p className="mt-0.5 text-xs text-subtle">Days done</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-8">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-20 blur-2xl"
            style={{ background: phase.color }}
            aria-hidden="true"
          />
          <Badge tone="brand">
            <Sparkles className="h-3.5 w-3.5" />
            Today&rsquo;s mission
          </Badge>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            {TODAY_MISSION.title}
          </h2>
          <p className="mt-2 leading-relaxed text-muted">{TODAY_MISSION.intention}</p>

          <ul className="mt-5 space-y-2">
            {TODAY_MISSION.steps.map((s) => (
              <li key={s.id} className="flex items-center gap-3 text-sm">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[var(--surface-inset)] text-xs font-bold text-subtle">
                  {s.duration}′
                </span>
                <span className="font-medium">{s.title}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/today">
              <Button className="group">
                Start — {TODAY_MISSION.estimatedMinutes} min
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <span className="text-sm text-subtle">
              You&rsquo;ve done {USER.completedDays.length} of these already.
            </span>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <QuickAction
          href="/mood"
          icon={<span className="text-2xl">{latestMood.emoji}</span>}
          title="Log your mood"
          subtitle={`Last logged: ${latestMood.label}`}
        />
        <QuickAction
          href="/journal"
          icon={<NotebookPen className="h-6 w-6 text-brand-500" />}
          title="Write a page"
          subtitle="Get it out of your head"
        />
        <QuickAction
          href="/meditate"
          icon={<Wind className="h-6 w-6 text-calm-500" />}
          title="Breathe"
          subtitle="3 minutes, right now"
        />
      </div>

      {/* Mood chart + weekly focus */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_minmax(0,1fr)]">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Your last 14 days</CardTitle>
            <Badge tone="grow">Trending up</Badge>
          </CardHeader>
          <CardContent>
            <MoodTrendChart data={recent} />
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Your mood is steadier than it was two weeks ago, even with the dip on
              the 28th. Steadiness comes before happiness — this is the right order.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card
            className="p-6"
            style={{
              background: `linear-gradient(135deg, ${phase.color}18, transparent)`,
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-subtle">
              This week&rsquo;s focus
            </p>
            <p className="mt-2 text-lg font-bold">{phase.tagline}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {phase.description}
            </p>
            <ProgressBar
              className="mt-5"
              value={
                ((USER.currentDay - phase.startDay + 1) /
                  (phase.endDay - phase.startDay + 1)) *
                100
              }
              label={`${phase.name} phase progress`}
              tone="grow"
            />
            <p className="mt-2 text-xs text-subtle">
              Day {USER.currentDay - phase.startDay + 1} of{" "}
              {phase.endDay - phase.startDay + 1} in this phase
            </p>
          </Card>

          <Card className="p-6">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-subtle">
              <Lightbulb className="h-4 w-4" />
              Coach insight
            </p>
            <p className="mt-3 text-sm leading-relaxed">
              You log your mood most consistently in the evening, and your best days
              this month all included a walk. That&rsquo;s worth noticing.
            </p>
            <Link
              href="/coach"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-300"
            >
              Talk it through
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Card>
        </div>
      </div>

      {/* Affirmation, quote, achievements */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="gradient-warm p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle">
            Today&rsquo;s affirmation
          </p>
          <p className="mt-3 text-lg font-bold leading-snug">{affirmation}</p>
        </Card>

        <Card className="p-7">
          <Quote className="h-6 w-6 text-brand-300 dark:text-brand-700" />
          <p className="mt-3 leading-relaxed">{DAILY_QUOTE.text}</p>
          <p className="mt-2 text-sm text-subtle">— {DAILY_QUOTE.author}</p>
        </Card>

        <Card className="p-7">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-subtle">
              Achievements
            </p>
            <span className="text-xs font-semibold text-subtle">
              {unlocked.length}/{ACHIEVEMENTS.length}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {ACHIEVEMENTS.map((a) => (
              <span
                key={a.id}
                title={`${a.name} — ${a.description}`}
                className={
                  "grid h-11 w-11 place-items-center rounded-2xl text-xl " +
                  (a.unlockedOn !== null
                    ? "bg-[var(--surface-muted)]"
                    : "bg-[var(--surface-inset)] opacity-30 grayscale")
                }
              >
                {a.icon}
              </span>
            ))}
          </div>
          <Link
            href="/journey"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-300"
          >
            View journey
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href}>
      <Card interactive className="flex items-center gap-4 p-5">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--surface-muted)]">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="font-bold">{title}</p>
          <p className="truncate text-sm text-subtle">{subtitle}</p>
        </div>
      </Card>
    </Link>
  );
}
