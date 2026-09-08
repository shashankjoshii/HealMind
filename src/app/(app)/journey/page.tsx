"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Lock, Star, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { PATH_BY_KEY, phaseForDay } from "@/lib/paths";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** XP needed for the next level — flat curve keeps the maths readable. */
const XP_PER_LEVEL = 700;

export default function JourneyPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const profile = useAppStore((s) => s.profile);
  const programmes = useAppStore((s) => s.programmes);
  const achievements = useAppStore((s) => s.achievements);

  const path = PATH_BY_KEY[profile.activePath];
  const programme = programmes[profile.activePath];
  const currentDay = programme?.currentDay ?? 1;
  const completedDays = programme?.completedDays ?? [];
  const currentPhase = phaseForDay(path, currentDay);
  const xpIntoLevel = profile.xp % XP_PER_LEVEL;
  const unlocked = achievements.filter((a) => a.unlockedOn !== null);

  return (
    <div className="space-y-6">
      <header>
        <p className="flex items-center gap-2 text-sm font-semibold text-muted">
          <Icon name={path.icon} className="h-4 w-4" />
          {path.name}
        </p>
        <h1 className="mt-2 font-display text-display-sm">Your journey</h1>
        <p className="mt-2 text-muted">
          {completedDays.length} days completed.{" "}
          {path.totalDays - currentDay} to go.
        </p>
      </header>

      {/* Level card */}
      <Card
        className="card-lit grain relative overflow-hidden p-7 text-white"
        style={{
          backgroundImage: `linear-gradient(140deg, ${path.gradient[0]}, ${path.gradient[1]})`,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-white/20 font-display text-3xl backdrop-blur">
              {profile.level}
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">
                Level {profile.level}
              </p>
              <p className="font-display text-2xl">{currentPhase.name} phase</p>
            </div>
          </div>

          <div className="flex gap-6">
            <div>
              <p className="flex items-center gap-1.5 font-display text-3xl">
                <Zap className="h-6 w-6" />
                {profile.xp.toLocaleString()}
              </p>
              <p className="text-xs text-white/70">Total XP</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 font-display text-3xl">
                <Star className="h-6 w-6" />
                {unlocked.length}
              </p>
              <p className="text-xs text-white/70">Badges</p>
            </div>
          </div>
        </div>

        <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-white/25">
          <motion.div
            className="h-full rounded-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${(xpIntoLevel / XP_PER_LEVEL) * 100}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <p className="mt-2 text-xs text-white/70">
          {XP_PER_LEVEL - xpIntoLevel} XP to level {profile.level + 1}
        </p>
      </Card>

      {/* Growth visual */}
      <Card className="card-lit flex flex-col items-center p-8">
        <HealingTree
          progress={currentDay / path.totalDays}
          color={path.gradient[0]}
        />
        <p className="mt-4 max-w-sm text-center text-sm leading-relaxed text-muted">
          Your tree grows a little with every day you complete. It doesn&rsquo;t
          shrink when you miss one.
        </p>
      </Card>

      {/* Phase-by-phase day grid */}
      {path.phases.map((phase) => {
        const days = Array.from(
          { length: phase.endDay - phase.startDay + 1 },
          (_, i) => phase.startDay + i,
        );
        const done = days.filter((d) => completedDays.includes(d)).length;

        return (
          <Card key={phase.key} className="card-lit p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: phase.color }}
                />
                <h2 className="font-display text-xl">{phase.name}</h2>
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
                const isDone = completedDays.includes(day);
                const isToday = day === currentDay;
                const isLocked = day > currentDay;
                // Not "missed" — under the progress-based day model, a past
                // day that isn't done yet is still just available, not
                // penalised. See the currentDay semantics note in plan.md.
                const isPending = !isDone && !isToday && !isLocked;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                    disabled={isLocked}
                    aria-label={`Day ${day}${isDone ? ", completed" : isLocked ? ", locked" : isToday ? ", today" : ", not yet done"}`}
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-2xl text-sm font-bold transition-all duration-200",
                      isDone && "text-white hover:scale-110",
                      isToday && "scale-110 text-white ring-4 ring-brand-500/25",
                      isPending &&
                        "bg-[var(--surface-inset)] text-subtle hover:scale-105",
                      isLocked &&
                        "cursor-not-allowed bg-[var(--surface-muted)] text-[var(--text-subtle)] opacity-50",
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
                      {completedDays.includes(selectedDay)
                        ? "You completed this day. Your reflection is saved in your journal."
                        : selectedDay === currentDay
                          ? "This is today. Your mission is waiting on the Today page."
                          : "Not done yet — that's fine. The programme doesn't reset, it just picks up where you left off."}
                    </p>
                  </div>
                </motion.div>
              )}
          </Card>
        );
      })}

      {/* Achievements */}
      <Card className="card-lit p-6 sm:p-7">
        <h2 className="font-display text-xl">Achievements</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {achievements.map((a) => {
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
                <Icon
                  name={a.icon}
                  className={cn("mx-auto h-8 w-8", !isUnlocked && "text-[var(--text-subtle)]")}
                />
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
function HealingTree({ progress, color }: { progress: number; color: string }) {
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
    <svg
      viewBox="0 0 220 220"
      className="w-56"
      role="img"
      aria-label={`Growth tree, ${Math.round(progress * 100)} percent grown`}
    >
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
          fill={i % 4 === 0 ? color : "var(--color-grow-400)"}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.9 }}
          transition={{ duration: 0.5, delay: i * 0.045, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: `${leaf.cx}px ${leaf.cy}px` }}
        />
      ))}
    </svg>
  );
}
