"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Logo } from "@/components/marketing/nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ProgressBar, ProgressRing } from "@/components/ui/progress-ring";
import { PHASES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type ChoiceStep = {
  id: string;
  kind: "choice";
  question: string;
  help?: string;
  options: string[];
};

type ScaleStep = {
  id: string;
  kind: "scale";
  question: string;
  help?: string;
  label: string;
  endLabels: [string, string];
};

type Step = ChoiceStep | ScaleStep;

const STEPS: Step[] = [
  {
    id: "duration",
    kind: "choice",
    question: "How long were you together?",
    help: "There's no length that makes this not count.",
    options: ["Under 6 months", "6 months – 2 years", "2 – 5 years", "Over 5 years"],
  },
  {
    id: "recency",
    kind: "choice",
    question: "When did it end?",
    options: ["This week", "This month", "1 – 3 months ago", "Over 3 months ago"],
  },
  {
    id: "kind",
    kind: "choice",
    question: "Which of these is closest?",
    options: [
      "A relationship ended",
      "A divorce or separation",
      "A situationship ended",
      "I left something toxic",
    ],
  },
  {
    id: "contact",
    kind: "choice",
    question: "Are you still in contact?",
    help: "Honest answers make the plan better. Nobody sees this.",
    options: ["No contact at all", "Occasionally", "Regularly", "We live or work together"],
  },
  {
    id: "mood",
    kind: "scale",
    question: "How have you felt this past week?",
    label: "Overall mood",
    endLabels: ["Awful", "Okay"],
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
    question: "How anxious have you felt?",
    label: "Anxiety",
    endLabels: ["Constantly", "Rarely"],
  },
  {
    id: "confidence",
    kind: "scale",
    question: "How do you feel about yourself right now?",
    label: "Confidence",
    endLabels: ["Very low", "Solid"],
  },
];

export default function OnboardingPage() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [finished, setFinished] = useState(false);

  const step = STEPS[index];
  const answered = answers[step?.id] !== undefined;
  const isLast = index === STEPS.length - 1;

  function choose(value: string | number) {
    setAnswers((a) => ({ ...a, [step.id]: value }));
  }

  function next() {
    if (isLast) setFinished(true);
    else setIndex((i) => i + 1);
  }

  if (finished) return <Result answers={answers} />;

  return (
    <main id="main" className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-10">
      <Link href="/" className="flex items-center gap-2.5 self-start">
        <Logo />
        <span className="text-lg font-extrabold tracking-tight">HealMind</span>
      </Link>

      <div className="mt-10">
        <ProgressBar
          value={((index + 1) / STEPS.length) * 100}
          label="Assessment progress"
        />
        <p className="mt-2 text-xs text-subtle">
          Question {index + 1} of {STEPS.length}
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {step.question}
            </h1>
            {step.help && <p className="mt-3 text-muted">{step.help}</p>}

            {step.kind === "choice" ? (
              <div className="mt-8 space-y-3">
                {step.options.map((option) => {
                  const selected = answers[step.id] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => choose(option)}
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
                  label={step.label}
                  value={(answers[step.id] as number) ?? 5}
                  onChange={choose}
                  endLabels={step.endLabels}
                  format={(v) => `${v}/10`}
                />
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={next}
          disabled={step.kind === "choice" && !answered}
          className="group"
        >
          {isLast ? "See my plan" : "Continue"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </main>
  );
}

function Result({ answers }: { answers: Record<string, string | number> }) {
  // Composite of the four scale answers, floored so nobody sees a demoralising
  // single-digit score on day one.
  const scales = ["mood", "sleep", "anxiety", "confidence"];
  const raw =
    scales.reduce((sum, key) => sum + ((answers[key] as number) ?? 5), 0) /
    scales.length;
  const score = Math.max(18, Math.round(raw * 10));

  return (
    <main id="main" className="mx-auto max-w-2xl px-5 py-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <h1 className="text-4xl font-extrabold tracking-tight">
          Your plan is ready
        </h1>
        <p className="mt-3 leading-relaxed text-muted">
          This is your starting point — not a verdict. It moves as you do.
        </p>

        <Card className="mt-10 flex flex-col items-center p-10">
          <ProgressRing value={score} size={190} label="Starting recovery score">
            <div>
              <p className="text-5xl font-extrabold tracking-tight">{score}</p>
              <p className="text-xs font-semibold text-subtle">Recovery score</p>
            </div>
          </ProgressRing>

          <p className="mt-6 max-w-sm leading-relaxed text-muted">
            Most people start between 15 and 40. By day 90, the average is 71 —
            and the biggest jumps happen between weeks three and six.
          </p>
        </Card>

        <Card className="mt-6 p-7 text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle">
            Your 90 days
          </p>
          <div className="mt-4 space-y-3">
            {PHASES.map((phase, i) => (
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

        <Link href="/dashboard" className="mt-8 inline-block">
          <Button size="lg" className="group">
            Start day 1
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>

        <p className="mt-6 text-sm text-subtle">
          Free forever. No card needed.
        </p>
      </motion.div>
    </main>
  );
}
