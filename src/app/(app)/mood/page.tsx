"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/input";
import { MetricsChart, MoodTrendChart, SleepChart } from "@/components/app/mood-chart";
import { MOOD_BY_KEY, MOOD_HISTORY, MOOD_OPTIONS } from "@/lib/mock-data";
import type { MoodKey } from "@/lib/types";
import { cn } from "@/lib/utils";

type Range = 7 | 30 | 60;

export default function MoodPage() {
  const [mood, setMood] = useState<MoodKey | null>(null);
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState(5);
  const [anxiety, setAnxiety] = useState(5);
  const [confidence, setConfidence] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [range, setRange] = useState<Range>(30);

  const windowed = useMemo(() => MOOD_HISTORY.slice(-range), [range]);

  const averages = useMemo(() => {
    const n = windowed.length;
    const sum = windowed.reduce(
      (acc, e) => ({
        mood: acc.mood + MOOD_BY_KEY[e.mood].score,
        anxiety: acc.anxiety + e.anxiety,
        confidence: acc.confidence + e.confidence,
        sleep: acc.sleep + e.sleepHours,
      }),
      { mood: 0, anxiety: 0, confidence: 0, sleep: 0 },
    );
    return {
      mood: (sum.mood / n).toFixed(1),
      anxiety: (sum.anxiety / n).toFixed(1),
      confidence: (sum.confidence / n).toFixed(1),
      sleep: (sum.sleep / n).toFixed(1),
    };
  }, [windowed]);

  function handleSave() {
    // Mock persistence — a real build would POST here.
    setSaved(true);
    setTimeout(() => setSaved(false), 2600);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-display-sm">
          How are you today?
        </h1>
        <p className="mt-2 text-muted">
          Ten seconds now gives you a picture you can trust later.
        </p>
      </header>

      {/* Check-in */}
      <Card className="p-7 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-subtle">
          Pick the closest one
        </p>

        <div className="mt-5 grid grid-cols-4 gap-2.5 sm:grid-cols-7">
          {MOOD_OPTIONS.map((option) => {
            const active = mood === option.key;
            return (
              <button
                key={option.key}
                onClick={() => setMood(option.key)}
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-3xl border-2 py-4 transition-all duration-200",
                  active
                    ? "scale-105 border-brand-400 bg-brand-50 dark:bg-brand-900/30"
                    : "border-transparent bg-[var(--surface-muted)] hover:scale-[1.03]",
                )}
              >
                <span className="text-3xl">{option.emoji}</span>
                <span className="text-xs font-semibold">{option.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-7 sm:grid-cols-2">
          <Slider label="Energy" value={energy} onChange={setEnergy} endLabels={["Drained", "Energised"]} format={(v) => `${v}/10`} />
          <Slider label="Stress" value={stress} onChange={setStress} endLabels={["Calm", "Overwhelmed"]} format={(v) => `${v}/10`} />
          <Slider label="Anxiety" value={anxiety} onChange={setAnxiety} endLabels={["Settled", "On edge"]} format={(v) => `${v}/10`} />
          <Slider label="Confidence" value={confidence} onChange={setConfidence} endLabels={["Low", "Strong"]} format={(v) => `${v}/10`} />
          <Slider label="Sleep quality" value={sleepQuality} onChange={setSleepQuality} endLabels={["Restless", "Deep"]} format={(v) => `${v}/10`} />
        </div>

        <div className="mt-7">
          <label htmlFor="mood-note" className="mb-2 block text-sm font-semibold">
            Anything you want to add? <span className="font-normal text-subtle">(optional)</span>
          </label>
          <Textarea
            id="mood-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What made today feel the way it did?"
            className="min-h-24"
          />
        </div>

        <div className="mt-6 flex items-center gap-4">
          <Button onClick={handleSave} disabled={!mood} size="lg">
            Save check-in
          </Button>
          {!mood && (
            <span className="text-sm text-subtle">Choose a mood to continue</span>
          )}
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-grow-600 dark:text-grow-400"
            >
              <Check className="h-4 w-4" />
              Logged — that&rsquo;s day {MOOD_HISTORY.length + 1}
            </motion.span>
          )}
        </div>
      </Card>

      {/* Range selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Your patterns</h2>
        <div className="flex gap-1.5 rounded-2xl bg-[var(--surface-muted)] p-1">
          {([7, 30, 60] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-colors",
                range === r
                  ? "bg-[var(--surface)] shadow-[var(--shadow-soft)]"
                  : "text-muted hover:text-[var(--text)]",
              )}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* Averages */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Avg mood" value={averages.mood} suffix="/7" tone="brand" />
        <StatTile label="Avg anxiety" value={averages.anxiety} suffix="/10" tone="soft" />
        <StatTile label="Avg confidence" value={averages.confidence} suffix="/10" tone="grow" />
        <StatTile label="Avg sleep" value={averages.sleep} suffix="h" tone="calm" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mood over time</CardTitle>
          </CardHeader>
          <CardContent>
            <MoodTrendChart data={windowed} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Anxiety vs confidence</CardTitle>
            <Badge tone="grow">Crossing over</Badge>
          </CardHeader>
          <CardContent>
            <MetricsChart data={windowed} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sleep</CardTitle>
          </CardHeader>
          <CardContent>
            <SleepChart data={windowed} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last 60 days</CardTitle>
          </CardHeader>
          <CardContent>
            <MoodHeatmap />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  suffix,
  tone,
}: {
  label: string;
  value: string;
  suffix: string;
  tone: "brand" | "soft" | "grow" | "calm";
}) {
  const colors = {
    brand: "text-brand-600 dark:text-brand-300",
    soft: "text-soft-500",
    grow: "text-grow-600 dark:text-grow-400",
    calm: "text-calm-600 dark:text-calm-400",
  };
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold text-subtle">{label}</p>
      <p className={cn("mt-1.5 text-3xl font-extrabold tracking-tight", colors[tone])}>
        {value}
        <span className="text-base font-bold text-subtle">{suffix}</span>
      </p>
    </Card>
  );
}

/** GitHub-style contribution grid, coloured by mood score. */
function MoodHeatmap() {
  return (
    <div>
      <div className="no-scrollbar overflow-x-auto pb-1">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5" style={{ minWidth: "max-content" }}>
          {MOOD_HISTORY.map((entry) => {
            const m = MOOD_BY_KEY[entry.mood];
            return (
              <span
                key={entry.date}
                title={`${entry.date} — ${m.label}`}
                className="h-4 w-4 rounded-[5px] transition-transform hover:scale-125"
                style={{
                  backgroundColor: m.color,
                  // Low scores read as faint rather than alarming red
                  opacity: 0.35 + (m.score / 7) * 0.65,
                }}
              />
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        {MOOD_OPTIONS.map((m) => (
          <span key={m.key} className="inline-flex items-center gap-1.5 text-xs text-subtle">
            <span
              className="h-3 w-3 rounded-[4px]"
              style={{ backgroundColor: m.color, opacity: 0.35 + (m.score / 7) * 0.65 }}
            />
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
