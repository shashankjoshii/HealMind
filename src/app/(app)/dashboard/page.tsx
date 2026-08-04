import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, Flame, Lightbulb, NotebookPen, Quote, Sparkles, Wind,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar, ProgressRing } from "@/components/ui/progress-ring";
import { MoodTrendChart } from "@/components/app/mood-chart";
import { HabitRow } from "@/components/app/habit-row";
import {
  ACHIEVEMENTS, AFFIRMATIONS, DAILY_QUOTE, HABITS, MOOD_BY_KEY, MOOD_HISTORY,
  TODAY_MISSION, USER, activePath,
} from "@/lib/mock-data";
import { phaseForDay } from "@/lib/paths";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const path = activePath();
  const phase = phaseForDay(path, USER.currentDay);
  const recent = MOOD_HISTORY.slice(-14);
  const latest = MOOD_HISTORY[MOOD_HISTORY.length - 1];
  const latestMood = MOOD_BY_KEY[latest.mood];
  const unlocked = ACHIEVEMENTS.filter((a) => a.unlockedOn !== null);
  const affirmation = AFFIRMATIONS[USER.currentDay % AFFIRMATIONS.length];
  const phaseProgress =
    ((USER.currentDay - phase.startDay + 1) /
      (phase.endDay - phase.startDay + 1)) *
    100;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-muted">
            <span>{path.emoji}</span>
            {path.name} · Day {USER.currentDay} of {path.totalDays}
          </p>
          <h1 className="mt-2 font-display text-display-sm">
            Good morning, {USER.name}
          </h1>
        </div>
        <Link href="/paths">
          <Button variant="secondary" size="sm">
            Switch path
          </Button>
        </Link>
      </header>

      <div className="bento">
        {/* Today's mission — the hero tile */}
        <Card
          className="card-lit grain bento-2 relative overflow-hidden p-8 text-white"
          style={{
            backgroundImage: `linear-gradient(140deg, ${path.gradient[0]}, ${path.gradient[1]})`,
          }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Today&rsquo;s mission
          </span>
          <h2 className="mt-4 font-display text-3xl">{TODAY_MISSION.title}</h2>
          <p className="mt-2.5 leading-relaxed text-white/85">
            {TODAY_MISSION.intention}
          </p>

          <ul className="mt-5 space-y-1.5">
            {TODAY_MISSION.steps.map((s) => (
              <li key={s.id} className="flex items-center gap-2.5 text-sm text-white/90">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white/20 text-[0.6875rem] font-bold">
                  {s.duration}′
                </span>
                {s.title}
              </li>
            ))}
          </ul>

          <Link href="/today" className="mt-7 inline-block">
            <Button variant="secondary" className="group !bg-white !text-brand-700">
              Start — {TODAY_MISSION.estimatedMinutes} min
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </Card>

        {/* Wellbeing ring */}
        <Card className="card-lit flex flex-col items-center justify-center p-7 text-center">
          <ProgressRing value={USER.wellbeingScore} size={140} label="Wellbeing score">
            <div>
              <p className="font-display text-4xl">{USER.wellbeingScore}</p>
              <p className="text-xs font-semibold text-subtle">Wellbeing</p>
            </div>
          </ProgressRing>
          <p className="mt-4 text-sm text-muted">
            Up 11 points since you started
          </p>
        </Card>

        {/* Streak */}
        <Card className="card-lit flex flex-col justify-between p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-subtle">
              Streak
            </p>
            <p className="mt-3 flex items-center gap-2 font-display text-5xl">
              <Flame className="h-9 w-9 text-warm-400" />
              {USER.streak}
            </p>
            <p className="mt-1.5 text-sm text-muted">
              Longest was {USER.longestStreak} days
            </p>
          </div>
          <div className="mt-5 flex gap-1.5">
            {MOOD_HISTORY.slice(-7).map((e) => (
              <span
                key={e.date}
                className="h-9 flex-1 rounded-lg"
                style={{
                  backgroundColor: MOOD_BY_KEY[e.mood].color,
                  opacity: 0.3 + (MOOD_BY_KEY[e.mood].score / 7) * 0.7,
                }}
              />
            ))}
          </div>
        </Card>

        {/* Phase progress */}
        <Card className="card-lit bento-2 p-7">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-subtle">
              Current phase
            </p>
            <Badge tone="neutral">
              {phase.name} · {phase.startDay}–{phase.endDay}
            </Badge>
          </div>
          <h3 className="mt-3 font-display text-2xl">{phase.tagline}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {phase.description}
          </p>
          <ProgressBar
            className="mt-5"
            value={phaseProgress}
            label={`${phase.name} phase progress`}
            tone="grow"
          />
          <p className="mt-2 text-xs text-subtle">
            Day {USER.currentDay - phase.startDay + 1} of{" "}
            {phase.endDay - phase.startDay + 1} in this phase
          </p>
        </Card>

        {/* Quick actions */}
        <QuickAction
          href="/mood"
          icon={<span className="text-2xl">{latestMood.emoji}</span>}
          title="Log your mood"
          subtitle={`Last: ${latestMood.label}`}
        />
        <QuickAction
          href="/journal"
          icon={<NotebookPen className="h-6 w-6 text-brand-500" />}
          title="Write a page"
          subtitle="Get it out of your head"
        />

        {/* Mood chart */}
        <Card className="card-lit bento-2 p-7">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-subtle">
              Last 14 days
            </p>
            <Badge tone="grow">Trending up</Badge>
          </div>
          <div className="mt-4">
            <MoodTrendChart data={recent} height={200} />
          </div>
        </Card>

        {/* Habits */}
        <Card className="card-lit bento-2 p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle">
            Habits this week
          </p>
          <div className="mt-4 space-y-3">
            {HABITS.map((h) => (
              <HabitRow key={h.id} habit={h} />
            ))}
          </div>
        </Card>

        {/* Coach insight */}
        <Card className="card-lit bento-2 p-7">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-subtle">
            <Lightbulb className="h-4 w-4" />
            Coach insight
          </p>
          <p className="mt-3 leading-relaxed">
            Your anxiety scores drop most on days you logged movement. It&rsquo;s
            the strongest single correlation in your data so far — worth
            protecting even on busy weeks.
          </p>
          <Link
            href="/coach"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-300"
          >
            Talk it through
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>

        {/* Breathe */}
        <QuickAction
          href="/meditate"
          icon={<Wind className="h-6 w-6 text-calm-500" />}
          title="Breathe"
          subtitle="3 minutes, right now"
        />

        {/* Achievements */}
        <Card className="card-lit p-7">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-subtle">
              Badges
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
                  "grid h-10 w-10 place-items-center rounded-2xl text-lg " +
                  (a.unlockedOn !== null
                    ? "bg-[var(--surface-muted)]"
                    : "bg-[var(--surface-inset)] opacity-30 grayscale")
                }
              >
                {a.icon}
              </span>
            ))}
          </div>
        </Card>

        {/* Affirmation */}
        <Card className="card-lit bento-2 mesh grain relative overflow-hidden p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle">
            Today&rsquo;s affirmation
          </p>
          <p className="mt-3 font-display text-2xl leading-snug">{affirmation}</p>
        </Card>

        {/* Quote */}
        <Card className="card-lit bento-2 p-7">
          <Quote className="h-6 w-6 text-brand-300 dark:text-brand-700" />
          <p className="mt-3 font-display text-xl leading-relaxed">
            {DAILY_QUOTE.text}
          </p>
          <p className="mt-2 text-sm text-subtle">— {DAILY_QUOTE.author}</p>
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
      <Card interactive className="card-lit flex h-full items-center gap-4 p-6">
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
