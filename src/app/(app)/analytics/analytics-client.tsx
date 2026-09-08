"use client";

import { useMemo } from "react";
import { ArrowDown, ArrowUp, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-ring";
import { MetricsChart, MoodTrendChart, SleepChart } from "@/components/app/mood-chart";
import { MOOD_BY_KEY } from "@/lib/mock-data";
import { PATH_BY_KEY } from "@/lib/paths";
import { useAppStore } from "@/lib/store";
import { averageMoodScore, deriveMoodHistory, selectMoodEntries } from "@/lib/store/selectors";
import type { MoodEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Compare the first and last thirds of the window to get a direction of travel. */
function trend(values: number[]) {
  const third = Math.max(1, Math.floor(values.length / 3));
  const early = values.slice(0, third);
  const late = values.slice(-third);
  const avg = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
  const from = avg(early);
  const to = avg(late);
  return { from, to, delta: to - from, pct: from !== 0 ? ((to - from) / from) * 100 : 0 };
}

function weekdayName(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long" });
}

/** Real groupby-average over actual history — no correlation, no ML, just honest arithmetic. Returns null without enough samples per weekday to say anything. */
function lowestAverageWeekday(history: MoodEntry[]): string | null {
  if (history.length < 14) return null;
  const buckets = new Map<string, number[]>();
  for (const e of history) {
    const day = weekdayName(e.date);
    const scores = buckets.get(day) ?? [];
    scores.push(MOOD_BY_KEY[e.mood].score);
    buckets.set(day, scores);
  }
  let lowestDay: string | null = null;
  let lowestAvg = Infinity;
  for (const [day, scores] of buckets) {
    if (scores.length < 2) continue;
    const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
    if (avg < lowestAvg) {
      lowestAvg = avg;
      lowestDay = day;
    }
  }
  return lowestDay;
}

export default function AnalyticsClient() {
  const profile = useAppStore((s) => s.profile);
  const programmes = useAppStore((s) => s.programmes);
  const moodEntriesRaw = useAppStore(selectMoodEntries);
  const history = useMemo(() => deriveMoodHistory(moodEntriesRaw), [moodEntriesRaw]);

  const path = PATH_BY_KEY[profile.activePath];
  const programme = programmes[profile.activePath];
  const completedDays = programme?.completedDays.length ?? 0;

  if (history.length === 0) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-display-sm">Analytics</h1>
          <p className="mt-2 text-muted">
            Log a few mood check-ins and your trends will appear here.
          </p>
        </header>
      </div>
    );
  }

  const moodTrend = trend(history.map((e) => MOOD_BY_KEY[e.mood].score));
  const anxietyTrend = trend(history.map((e) => e.anxiety));
  const confidenceTrend = trend(history.map((e) => e.confidence));
  const sleepTrend = trend(history.map((e) => e.sleepHours));
  const wellbeing = averageMoodScore(history);
  const wellbeingValue = wellbeing !== null ? Math.round((wellbeing / 7) * 100) : 0;
  const lowestDay = lowestAverageWeekday(history);

  const insights = [
    `Your sleep went from ${sleepTrend.from.toFixed(1)}h to ${sleepTrend.to.toFixed(1)}h a night, alongside the mood trend below.`,
    `Anxiety is ${anxietyTrend.pct <= 0 ? "down" : "up"} ${Math.abs(anxietyTrend.pct).toFixed(0)}% and confidence is ${confidenceTrend.pct >= 0 ? "up" : "down"} ${Math.abs(confidenceTrend.pct).toFixed(0)}% over this window.`,
    lowestDay
      ? `Your lowest-average day of the week so far is ${lowestDay}.`
      : null,
    `Longest streak so far is ${profile.longestStreak} days; current streak is ${profile.streak}.`,
  ].filter((s): s is string => s !== null);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-display-sm">
          Analytics
        </h1>
        <p className="mt-2 text-muted">
          {history.length} days of your own data. The trend matters more than any single day.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TrendCard label="Mood" from={moodTrend.from} to={moodTrend.to} pct={moodTrend.pct} suffix="/7" goodDirection="up" />
        <TrendCard label="Anxiety" from={anxietyTrend.from} to={anxietyTrend.to} pct={anxietyTrend.pct} suffix="/10" goodDirection="down" />
        <TrendCard label="Confidence" from={confidenceTrend.from} to={confidenceTrend.to} pct={confidenceTrend.pct} suffix="/10" goodDirection="up" />
        <TrendCard label="Sleep" from={sleepTrend.from} to={sleepTrend.to} pct={sleepTrend.pct} suffix="h" goodDirection="up" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle">
            Average mood
          </p>
          <p className="mt-2 text-4xl font-extrabold">{wellbeingValue}</p>
          <ProgressBar className="mt-4" value={wellbeingValue} label="Average mood" tone="grow" />
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Scaled from your mood score across this window. A fuller composite
            (mood stability, consistency, self-report) is still on the way.
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle">
            Programme progress
          </p>
          <p className="mt-2 text-4xl font-extrabold">
            {completedDays}/{path.totalDays}
          </p>
          <ProgressBar className="mt-4" value={(completedDays / path.totalDays) * 100} label="Programme progress" />
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Days completed in {path.name}. Progress is based on what you&rsquo;ve
            done, not the calendar — there&rsquo;s no such thing as a missed day here.
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle">
            Consistency
          </p>
          <p className="mt-2 text-4xl font-extrabold">{profile.streak}</p>
          <p className="mt-1 text-sm text-subtle">
            Current streak · longest was {profile.longestStreak}
          </p>
          <div className="mt-4 flex gap-1">
            {history.slice(-21).map((e) => (
              <span
                key={e.date}
                className="h-8 flex-1 rounded-[4px]"
                style={{
                  backgroundColor: MOOD_BY_KEY[e.mood].color,
                  opacity: 0.35 + (MOOD_BY_KEY[e.mood].score / 7) * 0.65,
                }}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-subtle">Last {Math.min(21, history.length)} days</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Mood, {history.length} days</CardTitle>
            <Badge tone={moodTrend.pct >= 0 ? "grow" : "soft"}>
              {moodTrend.pct >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(moodTrend.pct).toFixed(0)}%
            </Badge>
          </CardHeader>
          <CardContent>
            <MoodTrendChart data={history} height={280} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anxiety, confidence and energy</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricsChart data={history} height={280} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sleep</CardTitle>
          </CardHeader>
          <CardContent>
            <SleepChart data={history} height={260} />
          </CardContent>
        </Card>
      </div>

      <Card className="gradient-warm p-7">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-subtle">
          <Lightbulb className="h-4 w-4" />
          What the data says
        </p>
        <ul className="mt-4 space-y-3">
          {insights.map((insight) => (
            <li key={insight} className="flex items-start gap-2.5 text-sm leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              {insight}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function TrendCard({
  label,
  from,
  to,
  pct,
  suffix,
  goodDirection,
}: {
  label: string;
  from: number;
  to: number;
  pct: number;
  suffix: string;
  goodDirection: "up" | "down";
}) {
  const rising = pct > 0;
  const isGood = goodDirection === "up" ? rising : !rising;

  return (
    <Card className="p-5">
      <p className="text-xs font-semibold text-subtle">{label}</p>
      <p className="mt-1.5 text-3xl font-extrabold tracking-tight">
        {to.toFixed(1)}
        <span className="text-base font-bold text-subtle">{suffix}</span>
      </p>
      <p
        className={cn(
          "mt-2 inline-flex items-center gap-1 text-sm font-semibold",
          isGood ? "text-grow-600 dark:text-grow-400" : "text-warm-600 dark:text-warm-400",
        )}
      >
        {rising ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
        {Math.abs(pct).toFixed(0)}%
        <span className="font-normal text-subtle">from {from.toFixed(1)}</span>
      </p>
    </Card>
  );
}
