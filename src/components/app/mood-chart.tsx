"use client";

import {
  Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import type { MoodEntry } from "@/lib/types";
import { MOOD_BY_KEY } from "@/lib/mock-data";

function shortDate(key: string) {
  const [, m, d] = key.split("-");
  return `${Number(d)}/${Number(m)}`;
}

const axisProps = {
  stroke: "var(--text-subtle)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 shadow-[var(--shadow-lift)]">
      <p className="text-xs font-semibold text-subtle">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="mt-1 flex items-center gap-2 text-sm font-semibold">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

/** Mood score over time, with the seven-point scale on the Y axis. */
export function MoodTrendChart({
  data,
  height = 260,
}: {
  data: MoodEntry[];
  height?: number;
}) {
  const rows = data.map((e) => ({
    date: shortDate(e.date),
    Mood: MOOD_BY_KEY[e.mood].score,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={rows} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={0.32} />
            <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="date" {...axisProps} interval="preserveStartEnd" minTickGap={28} />
        <YAxis domain={[1, 7]} ticks={[1, 3, 5, 7]} {...axisProps} />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="Mood"
          stroke="var(--color-brand-500)"
          strokeWidth={2.5}
          fill="url(#moodFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Multi-metric comparison — anxiety and confidence crossing over is the story. */
export function MetricsChart({
  data,
  height = 280,
}: {
  data: MoodEntry[];
  height?: number;
}) {
  const rows = data.map((e) => ({
    date: shortDate(e.date),
    Anxiety: e.anxiety,
    Confidence: e.confidence,
    Energy: e.energy,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={rows} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="date" {...axisProps} interval="preserveStartEnd" minTickGap={28} />
        <YAxis domain={[0, 10]} ticks={[0, 5, 10]} {...axisProps} />
        <Tooltip content={<ChartTooltip />} />
        <Line type="monotone" dataKey="Anxiety" stroke="var(--color-soft-400)" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="Confidence" stroke="var(--color-grow-500)" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="Energy" stroke="var(--color-calm-500)" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SleepChart({
  data,
  height = 240,
}: {
  data: MoodEntry[];
  height?: number;
}) {
  const rows = data.map((e) => ({
    date: shortDate(e.date),
    Hours: e.sleepHours,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={rows} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="sleepFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-calm-400)" stopOpacity={0.34} />
            <stop offset="100%" stopColor="var(--color-calm-400)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="date" {...axisProps} interval="preserveStartEnd" minTickGap={28} />
        <YAxis domain={[0, 10]} ticks={[0, 4, 8]} {...axisProps} />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="Hours"
          stroke="var(--color-calm-500)"
          strokeWidth={2.5}
          fill="url(#sleepFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
