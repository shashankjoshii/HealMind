"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Logo } from "@/components/marketing/nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ProgressBar, ProgressRing } from "@/components/ui/progress-ring";
import { MOOD_OPTIONS } from "@/lib/mock-data";
import { PATHS, PATH_BY_KEY } from "@/lib/paths";
import { useAppStore } from "@/lib/store";
import type { MoodEntry, PathKey } from "@/lib/types";
import { cn, todayKey } from "@/lib/utils";

type ScaleStep = {
  id: string;
  kind: "scale";
  question: string;
  help?: string;
  label: string;
  endLabels: [string, string];
};

type ChoiceStep = {
  id: string;
  kind: "choice";
  question: string;
  help?: string;
  options: string[];
};

const QUESTIONS: (ScaleStep | ChoiceStep)[] = [
  {
    id: "mood",
    kind: "scale",
    question: "How have you felt this past week?",
    help: "Be honest — a low number here just means the plan starts where you are.",
    label: "Overall mood",
    endLabels: ["Awful", "Good"],
  },
  {
    id: "sleep",
    kind: "scale",
    question: "How have you been sleeping?",
    label: "Sleep quality",
    endLabels: ["Barely", "Well"],
  },
  {
    id: "anxiety",
    kind: "scale",
    question: "How anxious or on-edge have you felt?",
    label: "Calm",
    endLabels: ["Constantly anxious", "Settled"],
  },
  {
    id: "energy",
    kind: "scale",
    question: "How are your energy levels?",
    label: "Energy",
    endLabels: ["Running on empty", "Good"],
  },
  {
    id: "self",
    kind: "scale",
    question: "How do you feel about yourself right now?",
    label: "Self-regard",
    endLabels: ["Very low", "Solid"],
  },
  {
    id: "support",
    kind: "choice",
    question: "Have you tried support before?",
    help: "This only changes the tone of the guidance, nothing else.",
    options: [
      "This is my first time",
      "I've tried apps before",
      "I've had therapy before",
      "I'm in therapy now",
    ],
  },
];

export default function OnboardingPage() {
  // -1 is the path picker, which comes before the questions.
  const [index, setIndex] = useState(-1);
  const [path, setPath] = useState<PathKey | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [finished, setFinished] = useState(false);

  const total = QUESTIONS.length + 1;
  const step = index >= 0 ? QUESTIONS[index] : null;
  const isLast = index === QUESTIONS.length - 1;
  const canContinue =
    index === -1 ? path !== null : step?.kind === "scale" || answers[step!.id] !== undefined;

  function next() {
    if (isLast) setFinished(true);
    else setIndex((i) => i + 1);
  }

  if (finished && path) return <Result pathKey={path} answers={answers} />;

  return (
    <main id="main" className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-10">
      <Link href="/" className="flex items-center gap-2.5 self-start">
        <Logo />
        <span className="text-lg font-extrabold tracking-tight">HealMind</span>
      </Link>

      <div className="mt-10">
        <ProgressBar
          value={((index + 2) / total) * 100}
          label="Assessment progress"
        />
        <p className="mt-2 text-xs text-subtle">
          Step {index + 2} of {total}
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {index === -1 ? (
              <>
                <h1 className="font-display text-display-sm">
                  What brings you here?
                </h1>
                <p className="mt-3 text-muted">
                  Pick the one that sounds most like you right now. You can change
                  it or add others later.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {PATHS.map((p) => {
                    const selected = path === p.key;
                    return (
                      <button
                        key={p.key}
                        onClick={() => setPath(p.key)}
                        aria-pressed={selected}
                        className={cn(
                          "overflow-hidden rounded-3xl border-2 p-5 text-left transition-all duration-200",
                          selected
                            ? "border-transparent text-white shadow-[var(--shadow-lift)]"
                            : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]",
                        )}
                        style={
                          selected
                            ? {
                                backgroundImage: `linear-gradient(140deg, ${p.gradient[0]}, ${p.gradient[1]})`,
                              }
                            : undefined
                        }
                      >
                        <span className="text-3xl">{p.emoji}</span>
                        <p className="mt-3 font-bold">{p.name}</p>
                        <p
                          className={cn(
                            "mt-1 text-sm leading-relaxed",
                            selected ? "text-white/85" : "text-subtle",
                          )}
                        >
                          {p.tagline}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <h1 className="font-display text-display-sm">{step!.question}</h1>
                {step!.help && <p className="mt-3 text-muted">{step!.help}</p>}

                {step!.kind === "choice" ? (
                  <div className="mt-8 space-y-3">
                    {(step as ChoiceStep).options.map((option) => {
                      const selected = answers[step!.id] === option;
                      return (
                        <button
                          key={option}
                          onClick={() =>
                            setAnswers((a) => ({ ...a, [step!.id]: option }))
                          }
                          aria-pressed={selected}
                          className={cn(
                            "flex w-full items-center justify-between rounded-3xl border-2 px-6 py-5 text-left font-semibold transition-all duration-200",
                            selected
                              ? "border-brand-400 bg-brand-50 dark:bg-brand-900/30"
                              : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]",
                          )}
                        >
                          {option}
                          {selected && (
                            <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500 text-white">
                              <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="mt-8 p-7">
                    <Slider
                      label={(step as ScaleStep).label}
                      value={(answers[step!.id] as number) ?? 5}
                      onChange={(v) =>
                        setAnswers((a) => ({ ...a, [step!.id]: v }))
                      }
                      endLabels={(step as ScaleStep).endLabels}
                      format={(v) => `${v}/10`}
                    />
                  </Card>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setIndex((i) => Math.max(-1, i - 1))}
          disabled={index === -1}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={next} disabled={!canContinue} className="group">
          {isLast ? "See my plan" : "Continue"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </main>
  );
}

/**
 * The onboarding sliders don't map 1:1 onto MoodEntry's fields — some
 * (sleepHours) aren't asked at all, and some ("Calm", where high = settled)
 * are inverted relative to how MoodEntry stores them (anxiety, where high =
 * more anxious). This is the one real entry the plan calls for writing on
 * onboarding completion; everything here is a documented best-effort
 * conversion of what was actually asked, not a fabricated number.
 */
function deriveTodayMoodEntry(answers: Record<string, string | number>): MoodEntry {
  const scale = (key: string) => (answers[key] as number) ?? 5;
  const calm = scale("anxiety"); // slider is labelled "Calm": 1 = constantly anxious, 10 = settled
  const anxiety = 11 - calm;
  const moodScore = Math.min(7, Math.max(1, Math.round((scale("mood") / 10) * 7)));
  const mood = (MOOD_OPTIONS.find((m) => m.score === moodScore) ?? MOOD_OPTIONS[3]).key;

  return {
    date: todayKey(),
    mood,
    energy: scale("energy"),
    stress: anxiety, // no separate stress question asked — anxiety is the closest proxy
    anxiety,
    confidence: scale("self"),
    sleepHours: 4 + (scale("sleep") / 10) * 4, // 4-8h, estimated from sleep quality (hours weren't asked)
    sleepQuality: scale("sleep"),
  };
}

function Result({
  pathKey,
  answers,
}: {
  pathKey: PathKey;
  answers: Record<string, string | number>;
}) {
  const router = useRouter();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const path = PATH_BY_KEY[pathKey];

  // Composite of the five scale answers, floored so nobody sees a demoralising
  // single-digit score on day one.
  const scales = ["mood", "sleep", "anxiety", "energy", "self"];
  const raw =
    scales.reduce((sum, key) => sum + ((answers[key] as number) ?? 5), 0) /
    scales.length;
  const score = Math.max(18, Math.round(raw * 10));

  function start() {
    completeOnboarding({ path: pathKey, today: deriveTodayMoodEntry(answers) });
    router.push("/dashboard");
  }

  return (
    <main id="main" className="mx-auto max-w-2xl px-5 py-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <span className="text-5xl">{path.emoji}</span>
        <h1 className="mt-5 font-display text-display-sm">Your plan is ready</h1>
        <p className="mt-3 leading-relaxed text-muted">
          {path.totalDays} days on the {path.name.toLowerCase()} path. This is
          your starting point — not a verdict.
        </p>

        <Card className="card-lit mt-10 flex flex-col items-center p-10">
          <ProgressRing value={score} size={190} label="Starting wellbeing score">
            <div>
              <p className="font-display text-5xl">{score}</p>
              <p className="text-xs font-semibold text-subtle">Wellbeing</p>
            </div>
          </ProgressRing>

          <p className="mt-6 max-w-sm leading-relaxed text-muted">
            Most people start between 15 and 40. The biggest jumps usually happen
            between weeks three and six.
          </p>
        </Card>

        <Card className="card-lit mt-6 p-7 text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle">
            Your {path.phases.length} phases
          </p>
          <div className="mt-4 space-y-3">
            {path.phases.map((phase, i) => (
              <motion.div
                key={phase.key}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-4"
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-xs font-bold text-white"
                  style={{ backgroundColor: phase.color }}
                >
                  {phase.startDay}
                </span>
                <div className="min-w-0">
                  <p className="font-bold">{phase.name}</p>
                  <p className="truncate text-sm text-subtle">{phase.tagline}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        <Button size="lg" className="group mt-8" onClick={start}>
          Start day 1
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>

        <p className="mt-6 text-sm text-subtle">Free forever. No card needed.</p>
      </motion.div>
    </main>
  );
}
