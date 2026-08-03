"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Lock, Star, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-ring";
import { ACHIEVEMENTS, PHASES, USER, phaseForDay } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** XP needed for the next level — flat curve keeps the maths readable. */
const XP_PER_LEVEL = 700;

export default function JourneyPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const xpIntoLevel = USER.xp % XP_PER_LEVEL;
  const unlocked = ACHIEVEMENTS.filter((a) => a.unlockedOn !== null);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Your journey
        </h1>
        <p className="mt-2 text-muted">
          {USER.completedDays.length} days completed. {90 - USER.currentDay} to go.
        </p>
      </header>

      {/* Level card */}
      <Card className="gradient-warm p-7">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-3xl gradient-brand text-2xl font-extrabold text-white shadow-[var(--shadow-glow)]">
              {USER.level}
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-subtle">
                Level {USER.level}
              </p>
              <p className="text-xl font-extrabold">
                {phaseForDay(USER.currentDay).name} phase
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div>
              <p className="flex items-center gap-1.5 text-2xl font-extrabold">
                <Zap className="h-5 w-5 text-warm-400" />
                {USER.xp.toLocaleString()}
              </p>
              <p className="text-xs text-subtle">Total XP</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-2xl font-extrabold">
                <Star className="h-5 w-5 text-brand-400" />
                {unlocked.length}
              </p>
              <p className="text-xs text-subtle">Badges</p>
            </div>
          </div>
        </div>

        <ProgressBar
          className="mt-6"
          value={(xpIntoLevel / XP_PER_LEVEL) * 100}
          label={`Progress to level ${USER.level + 1}`}
        />
        <p className="mt-2 text-xs text-subtle">
          {XP_PER_LEVEL - xpIntoLevel} XP to level {USER.level + 1}
        </p>
      </Card>

      {/* Healing tree — grows with completion */}
      <Card className="flex flex-col items-center p-8">
        <HealingTree progress={USER.currentDay / 90} />
        <p className="mt-4 text-center text-sm leading-relaxed text-muted">
          Your tree grows a little with every day you complete. It doesn&rsquo;t
          shrink when you miss one.
        </p>
      </Card>

      {/* Phase-by-phase day grid */}
      {PHASES.map((phase) => {
        const days = Array.from(
          { length: phase.endDay - phase.startDay + 1 },
          (_, i) => phase.startDay + i,
        );
        const done = days.filter((d) => USER.completedDays.includes(d)).length;

        return (
          <Card key={phase.key} className="p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: phase.color }}
                />
                <h2 className="text-lg font-bold">{phase.name}</h2>
                <span className="text-sm text-subtle">
                  Days {phase.startDay}–{phase.endDay}
                </span>
              </div>
              <Badge tone={done === days.length ? "grow" : "neutral"}>
                {done}/{days.length} complete
              </Badge>
            </div>

            <p className="mt-2 text-sm text-muted">{phase.tagline}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {days.map((day) => {
                const isDone = USER.completedDays.includes(day);
                const isToday = day === USER.currentDay;
                const isLocked = day > USER.currentDay;
                const isMissed = !isDone && !isToday && !isLocked;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                    disabled={isLocked}
                    aria-label={`Day ${day}${isDone ? ", completed" : isLocked ? ", locked" : isToday ? ", today" : ", missed"}`}
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-2xl text-sm font-bold transition-all duration-200",
                      isDone && "text-white hover:scale-110",
                      isToday &&
                        "scale-110 ring-4 ring-brand-500/25 text-white animate-pulse",
                      isMissed &&
                        "bg-[var(--surface-inset)] text-subtle hover:scale-105",
                      isLocked && "cursor-not-allowed bg-[var(--surface-muted)] text-[var(--text-subtle)] opacity-50",
                    )}
                    style={
                      isDone || isToday ? { backgroundColor: phase.color } : undefined
                    }
                  >
                    {isDone ? (
                      <Check className="h-4 w-4" />
                    ) : isLocked ? (
                      <Lock className="h-3.5 w-3.5" />
                    ) : (
                      day
                    )}
                  </button>
                );
              })}
            </div>

            {selectedDay !== null &&
              selectedDay >= phase.startDay &&
              selectedDay <= phase.endDay && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-5 overflow-hidden"
                >
                  <div className="rounded-2xl bg-[var(--surface-muted)] p-5">
                    <p className="font-bold">Day {selectedDay}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {USER.completedDays.includes(selectedDay)
                        ? "You completed this day. Your reflection is saved in your journal."
                        : selectedDay === USER.currentDay
                          ? "This is today. Your mission is waiting on the Today page."
                          : "You missed this one. That's allowed — the programme doesn't reset."}
                    </p>
                  </div>
                </motion.div>
              )}
          </Card>
        );
      })}

      {/* Achievements */}
      <Card className="p-6 sm:p-7">
        <h2 className="text-lg font-bold">Achievements</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ACHIEVEMENTS.map((a) => {
            const isUnlocked = a.unlockedOn !== null;
            return (
              <div
                key={a.id}
                className={cn(
                  "rounded-3xl border p-5 text-center transition-all",
                  isUnlocked
                    ? "border-[var(--border)] bg-[var(--surface-muted)]"
                    : "border-dashed border-[var(--border)] opacity-45",
                )}
              >
                <span className={cn("text-3xl", !isUnlocked && "grayscale")}>
                  {a.icon}
                </span>
                <p className="mt-2.5 font-bold">{a.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-subtle">
                  {a.description}
                </p>
                <p className="mt-3 text-xs font-bold text-brand-600 dark:text-brand-300">
                  {isUnlocked ? `+${a.xp} XP · Day ${a.unlockedOn}` : `${a.xp} XP`}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/** Simple generative tree — branches and leaves scale with programme progress. */
function HealingTree({ progress }: { progress: number }) {
  const leafCount = Math.round(progress * 22);
  const leaves = Array.from({ length: leafCount }, (_, i) => {
    // Deterministic placement so server and client agree.
    const angle = (i * 137.5 * Math.PI) / 180;
    const radius = 26 + (i % 5) * 12;
    return {
      cx: 110 + Math.cos(angle) * radius,
      cy: 88 + Math.sin(angle) * radius * 0.82,
      r: 6 + (i % 3),
    };
  });

  return (
    <svg viewBox="0 0 220 220" className="w-56" role="img" aria-label={`Healing tree, ${Math.round(progress * 100)} percent grown`}>
      <defs>
        <linearGradient id="trunk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a6a4a" />
          <stop offset="100%" stopColor="#5f4632" />
        </linearGradient>
      </defs>

      <ellipse cx="110" cy="196" rx="54" ry="8" fill="var(--surface-inset)" />
      <path d="M104 196 L104 118 Q110 100 116 118 L116 196 Z" fill="url(#trunk)" />
      <path d="M108 140 Q84 122 74 104" stroke="url(#trunk)" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M112 132 Q138 116 148 98" stroke="url(#trunk)" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M110 152 Q92 144 82 134" stroke="url(#trunk)" strokeWidth="4.5" fill="none" strokeLinecap="round" />

      {leaves.map((leaf, i) => (
        <motion.circle
          key={i}
          cx={leaf.cx}
          cy={leaf.cy}
          r={leaf.r}
          fill={i % 4 === 0 ? "var(--color-brand-400)" : "var(--color-grow-400)"}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.9 }}
          transition={{ duration: 0.5, delay: i * 0.045, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: `${leaf.cx}px ${leaf.cy}px` }}
        />
      ))}
    </svg>
  );
}
