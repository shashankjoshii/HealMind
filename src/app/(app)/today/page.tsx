"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-ring";
import { Textarea } from "@/components/ui/input";
import { TODAY_MISSION, USER, phaseForDay } from "@/lib/mock-data";

export default function TodayPage() {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const steps = TODAY_MISSION.steps;
  const current = steps[step];
  const phase = phaseForDay(TODAY_MISSION.day);
  const isLast = step === steps.length - 1;

  function next() {
    if (isLast) setDone(true);
    else setStep((s) => s + 1);
  }

  if (done) return <Completion />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <div className="flex items-center gap-2.5">
          <Badge tone="brand" style={{ backgroundColor: `${phase.color}22` }}>
            Day {TODAY_MISSION.day} · {phase.name}
          </Badge>
          <span className="text-sm text-subtle">
            ~{TODAY_MISSION.estimatedMinutes} min
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {TODAY_MISSION.title}
        </h1>
        <p className="mt-2 leading-relaxed text-muted">{TODAY_MISSION.intention}</p>
      </header>

      <div>
        <ProgressBar
          value={((step + 1) / steps.length) * 100}
          label="Mission progress"
        />
        <p className="mt-2 text-xs text-subtle">
          Step {step + 1} of {steps.length}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="p-7 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-subtle">
              {current.kind} · {current.duration} min
            </p>
            <h2 className="mt-2.5 text-2xl font-extrabold">{current.title}</h2>
            <p className="mt-3 leading-relaxed text-muted">{current.description}</p>

            {current.kind === "breathing" ? (
              <BreathingPacer />
            ) : current.prompt ? (
              <div className="mt-6">
                <label
                  htmlFor={`prompt-${current.id}`}
                  className="mb-2.5 block text-sm font-semibold italic text-brand-700 dark:text-brand-300"
                >
                  {current.prompt}
                </label>
                <Textarea
                  id={`prompt-${current.id}`}
                  value={responses[current.id] ?? ""}
                  onChange={(e) =>
                    setResponses((r) => ({ ...r, [current.id]: e.target.value }))
                  }
                  placeholder="Take your time."
                  className="min-h-40"
                />
              </div>
            ) : null}

            <div className="mt-7 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={next} className="group">
                {isLast ? "Complete mission" : "Next"}
                {isLast ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <p className="text-center text-sm text-subtle">
        You can stop at any point — your progress saves as you go.
      </p>
    </div>
  );
}

/** 4-4-4-4 box breathing. Phase timing drives both the label and the circle. */
function BreathingPacer() {
  const PHASES = [
    { label: "Breathe in", seconds: 4, scale: 1.35 },
    { label: "Hold", seconds: 4, scale: 1.35 },
    { label: "Breathe out", seconds: 4, scale: 1 },
    { label: "Hold", seconds: 4, scale: 1 },
  ];

  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [rounds, setRounds] = useState(0);
  const reduce = useReducedMotion();
  const phase = PHASES[phaseIndex];

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => {
      setPhaseIndex((i) => {
        const nextIndex = (i + 1) % PHASES.length;
        if (nextIndex === 0) setRounds((r) => r + 1);
        return nextIndex;
      });
    }, phase.seconds * 1000);
    return () => clearTimeout(timer);
    // PHASES is a stable literal; phaseIndex drives the cycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phaseIndex]);

  return (
    <div className="mt-8 flex flex-col items-center">
      <div className="relative grid h-56 w-56 place-items-center">
        <motion.span
          className="absolute h-40 w-40 rounded-full gradient-brand opacity-25 blur-xl"
          animate={running && !reduce ? { scale: phase.scale } : { scale: 1 }}
          transition={{ duration: phase.seconds, ease: "easeInOut" }}
        />
        <motion.span
          className="absolute h-36 w-36 rounded-full gradient-brand opacity-70"
          animate={running && !reduce ? { scale: phase.scale } : { scale: 1 }}
          transition={{ duration: phase.seconds, ease: "easeInOut" }}
        />
        <span className="relative z-10 text-center text-white">
          <span className="block text-lg font-bold">
            {running ? phase.label : "Ready?"}
          </span>
          {running && (
            <span className="mt-0.5 block text-sm opacity-80">
              {rounds} {rounds === 1 ? "round" : "rounds"}
            </span>
          )}
        </span>
      </div>

      <Button
        variant={running ? "secondary" : "primary"}
        onClick={() => {
          setRunning((r) => !r);
          if (running) {
            setPhaseIndex(0);
            setRounds(0);
          }
        }}
        className="mt-4"
      >
        {running ? "Stop" : "Start breathing"}
      </Button>
    </div>
  );
}

function Completion() {
  const reduce = useReducedMotion();

  // Deterministic confetti placement — Math.random() would break hydration.
  const confetti = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        delay: (i % 9) * 0.09,
        duration: 2.4 + ((i * 13) % 12) / 10,
        color: ["#6c63ff", "#3a90f5", "#24a271", "#ffb547", "#ff9d9d"][i % 5],
        rotate: (i * 47) % 360,
      })),
    [],
  );

  return (
    <div className="relative mx-auto max-w-lg py-12 text-center">
      {!reduce && (
        <div className="pointer-events-none absolute inset-x-0 -top-8 h-[32rem] overflow-hidden" aria-hidden="true">
          {confetti.map((c, i) => (
            <motion.span
              key={i}
              className="absolute top-0 h-2.5 w-2.5 rounded-[3px]"
              style={{ left: c.left, backgroundColor: c.color }}
              initial={{ y: -30, opacity: 0, rotate: 0 }}
              animate={{ y: 520, opacity: [0, 1, 1, 0], rotate: c.rotate }}
              transition={{ duration: c.duration, delay: c.delay, ease: "easeIn" }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="mx-auto grid h-24 w-24 place-items-center rounded-4xl gradient-brand text-white shadow-[var(--shadow-glow)]"
      >
        <Check className="h-11 w-11" strokeWidth={3} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-7 text-3xl font-extrabold tracking-tight"
      >
        Day {TODAY_MISSION.day} complete
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-3 leading-relaxed text-muted"
      >
        That&rsquo;s {USER.streak + 1} days in a row. You showed up on a day you
        didn&rsquo;t have to — that&rsquo;s the whole thing, really.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 grid grid-cols-3 gap-3"
      >
        {[
          { label: "XP earned", value: "+120" },
          { label: "Streak", value: `${USER.streak + 1}` },
          { label: "Days done", value: `${USER.completedDays.length + 1}` },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="mt-0.5 text-xs text-subtle">{s.label}</p>
          </Card>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
      >
        <Link href="/mood">
          <Button className="w-full sm:w-auto">
            <Sparkles className="h-4 w-4" />
            Log today&rsquo;s mood
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="secondary" className="w-full sm:w-auto">
            Back to dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
