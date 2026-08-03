import type { Metadata } from "next";
import { ArrowDown, ArrowUp, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-ring";
import { MetricsChart, MoodTrendChart, SleepChart } from "@/components/app/mood-chart";
import { MOOD_BY_KEY, MOOD_HISTORY, USER } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics" };

/** Compare the first and last thirds of the window to get a direction of travel. */
function trend(values: number[]) {
  const third = Math.max(1, Math.floor(values.length / 3));
  const early = values.slice(0, third);
  const late = values.slice(-third);
  const avg = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
  const from = avg(early);
  const to = avg(late);
  return { from, to, delta: to - from, pct: ((to - from) / from) * 100 };
}

export default function AnalyticsPage() {
  const history = MOOD_HISTORY;
  const moodTrend = trend(history.map((e) => MOOD_BY_KEY[e.mood].score));
  const anxietyTrend = trend(history.map((e) => e.anxiety));
  const confidenceTrend = trend(history.map((e) => e.confidence));
  const sleepTrend = trend(history.map((e) => e.sleepHours));

  const completionRate = (USER.completedDays.length / (USER.currentDay - 1)) * 100;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Analytics
        </h1>
        <p className="mt-2 text-muted">
          Sixty days of your own data. The trend matters more than any single day.
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
            Recovery score
          </p>
          <p className="mt-2 text-4xl font-extrabold">{USER.recoveryScore}</p>
          <ProgressBar className="mt-4" value={USER.recoveryScore} label="Recovery score" tone="grow" />
          <p className="mt-3 text-sm leading-relaxed text-muted">
            A composite of mood stability, check-in consistency, and self-reported
            confidence. It moves slowly by design.
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle">
            Completion rate
          </p>
          <p className="mt-2 text-4xl font-extrabold">
            {Math.round(completionRate)}%
          </p>
          <ProgressBar className="mt-4" value={completionRate} label="Completion rate" />
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {USER.completedDays.length} of {USER.currentDay - 1} days completed.
            You&rsquo;ve missed three, and none of them cost you progress.
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle">
            Consistency
          </p>
          <p className="mt-2 text-4xl font-extrabold">{USER.streak}</p>
          <p className="mt-1 text-sm text-subtle">
            Current streak · longest was {USER.longestStreak}
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
          <p className="mt-2 text-xs text-subtle">Last 21 days</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Mood, 60 days</CardTitle>
            <Badge tone="grow">
              <ArrowUp className="h-3 w-3" />
              {moodTrend.pct.toFixed(0)}%
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
          {[
            `Your sleep went from ${sleepTrend.from.toFixed(1)}h to ${sleepTrend.to.toFixed(1)}h a night. That single change explains a lot of the mood improvement below it.`,
            `Anxiety is down ${Math.abs(anxietyTrend.pct).toFixed(0)}% and confidence is up ${confidenceTrend.pct.toFixed(0)}%. Those two crossing over usually happens around week five.`,
            "Your lowest days cluster on Sundays. Worth planning something for Sunday afternoons.",
            "You've missed three days and returned every time. Recovery from a lapse predicts outcomes better than an unbroken streak does.",
          ].map((insight) => (
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
