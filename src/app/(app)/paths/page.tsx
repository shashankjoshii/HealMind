"use client";

import { motion } from "framer-motion";
import { Check, Lock, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-ring";
import { PATHS } from "@/lib/paths";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function PathsPage() {
  const active = useAppStore((s) => s.profile.activePath);
  const enrolled = useAppStore((s) => s.profile.enrolledPaths);
  const programmes = useAppStore((s) => s.programmes);
  const switchPath = useAppStore((s) => s.switchPath);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-display-sm">Programmes</h1>
        <p className="mt-2 text-muted">
          Switch focus whenever you need to. Your progress on every path is kept.
        </p>
      </header>

      <div className="rounded-3xl border border-calm-200 bg-calm-50 p-5 dark:border-calm-900 dark:bg-calm-950/30">
        <p className="text-sm leading-relaxed text-muted">
          <strong className="text-[var(--text)]">One at a time works better.</strong>{" "}
          You can enrol in several, but people who focus on a single path finish
          roughly twice as often. Free plan covers one path at a time.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {PATHS.map((path, i) => {
          const isActive = path.key === active;
          const isEnrolled = enrolled.includes(path.key);
          const day = programmes[path.key]?.currentDay ?? 0;
          const pct = (day / path.totalDays) * 100;

          return (
            <motion.div
              key={path.key}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.35) }}
            >
              <Card
                className={cn(
                  "card-lit h-full overflow-hidden",
                  isActive && "ring-2 ring-brand-400",
                )}
              >
                <div
                  className="grain relative p-7 text-white"
                  style={{
                    backgroundImage: `linear-gradient(140deg, ${path.gradient[0]}, ${path.gradient[1]})`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-4xl">{path.emoji}</span>
                    {isActive && (
                      <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-bold backdrop-blur">
                        Active
                      </span>
                    )}
                  </div>
                  <h2 className="mt-4 font-display text-2xl">{path.name}</h2>
                  <p className="mt-1.5 text-sm text-white/85">{path.tagline}</p>
                </div>

                <div className="p-7">
                  <p className="text-sm leading-relaxed text-muted">
                    {path.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {path.signals.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs text-muted"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center gap-3 text-xs text-subtle">
                    <span>{path.totalDays} days</span>
                    <span className="h-1 w-1 rounded-full bg-[var(--border-strong)]" />
                    <span>{path.phases.length} phases</span>
                  </div>

                  {isEnrolled && (
                    <div className="mt-4">
                      <ProgressBar
                        value={pct}
                        label={`${path.name} progress`}
                        tone={isActive ? "brand" : "grow"}
                      />
                      <p className="mt-1.5 text-xs text-subtle">
                        Day {day} of {path.totalDays}
                      </p>
                    </div>
                  )}

                  <div className="mt-6">
                    {isActive ? (
                      <Button variant="secondary" className="w-full" disabled>
                        <Check className="h-4 w-4" />
                        Currently active
                      </Button>
                    ) : (
                      <Button
                        variant={isEnrolled ? "outline" : "primary"}
                        className="w-full"
                        onClick={() => switchPath(path.key)}
                      >
                        {isEnrolled ? (
                          <>Switch to this path</>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Start this path
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="card-lit flex flex-col items-start gap-4 p-7 sm:flex-row sm:items-center">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--surface-muted)]">
          <Lock className="h-5 w-5 text-subtle" />
        </span>
        <div className="flex-1">
          <p className="font-bold">Want all six at once?</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Premium unlocks every path simultaneously, plus the full meditation
            library and unlimited coach access.
          </p>
        </div>
        <Badge tone="brand">£8/month</Badge>
      </Card>
    </div>
  );
}
