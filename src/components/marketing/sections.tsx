"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity, BookOpen, Brain, Check, CloudMoon, Compass, Flower2, Lightbulb,
  MessageCircleHeart, NotebookPen, Quote, ShieldAlert, Sparkles, Target,
  Users, Wind,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PATHS } from "@/lib/paths";
import { cn } from "@/lib/utils";

/** Scroll-triggered fade-up used by every section below. */
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <Badge tone="brand">{eyebrow}</Badge>
      <h2 className="mt-4 font-display text-display-sm">{title}</h2>
      {subtitle && <p className="mt-4 text-lg leading-relaxed text-muted">{subtitle}</p>}
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */

/** The path explorer replaces the old breakup-only 90-day timeline. */
export function PathExplorer() {
  const [active, setActive] = useState(0);
  const path = PATHS[active];

  return (
    <section id="paths" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="Programmes"
          title="Six paths. Pick the one that sounds like you."
          subtitle="Each is a real, structured programme with its own phases and daily work — not the same content with a different label."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[19rem_1fr]">
          {/* Path list */}
          <div className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {PATHS.map((p, i) => (
              <button
                key={p.key}
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                className={cn(
                  "flex min-w-[13rem] items-center gap-3 rounded-3xl border p-4 text-left transition-all duration-300 lg:min-w-0",
                  i === active
                    ? "border-transparent text-white shadow-[var(--shadow-lift)]"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]",
                )}
                style={
                  i === active
                    ? {
                        backgroundImage: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})`,
                      }
                    : undefined
                }
              >
                <Icon name={p.icon} className="h-6 w-6 shrink-0" />
                <span className="min-w-0">
                  <span className="block text-[0.9375rem] font-bold leading-tight">
                    {p.name}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block text-xs",
                      i === active ? "text-white/75" : "text-subtle",
                    )}
                  >
                    {p.totalDays} days
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* Active path detail */}
          <motion.div
            key={path.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="card-lit overflow-hidden">
              <div
                className="grain relative p-8 text-white sm:p-10"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${path.gradient[0]}, ${path.gradient[1]})`,
                }}
              >
                <Icon name={path.icon} className="h-9 w-9" />
                <h3 className="mt-4 font-display text-3xl sm:text-4xl">{path.name}</h3>
                <p className="mt-3 max-w-xl leading-relaxed text-white/85">
                  {path.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {path.signals.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-white/18 px-3 py-1.5 text-xs font-medium backdrop-blur"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-8 sm:p-10">
                <div className="flex items-baseline justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-subtle">
                    {path.phases.length} phases · {path.totalDays} days
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  {path.phases.map((phase) => (
                    <div
                      key={phase.key}
                      className="rounded-2xl bg-[var(--surface-muted)] p-5"
                    >
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: phase.color }}
                        />
                        <p className="font-bold">{phase.name}</p>
                        <span className="text-xs text-subtle">
                          Days {phase.startDay}–{phase.endDay}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {phase.description}
                      </p>
                      <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                        {phase.activities.map((a) => (
                          <li
                            key={a}
                            className="flex items-start gap-2 text-sm text-muted"
                          >
                            <Check
                              className="mt-0.5 h-3.5 w-3.5 shrink-0"
                              style={{ color: phase.color }}
                            />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <Link href="/onboarding" className="mt-7 inline-block">
                  <Button>Start {path.name.toLowerCase()}</Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const STEPS = [
  {
    icon: Compass,
    title: "Find your path",
    body: "A short assessment points you at the programme that fits what you're actually dealing with — not what's trending.",
    tone: "brand" as const,
  },
  {
    icon: Target,
    title: "Fifteen minutes a day",
    body: "One focused mission daily: a reflection, a CBT exercise, a breathing practice. Small enough to do on a bad day.",
    tone: "calm" as const,
  },
  {
    icon: Activity,
    title: "Watch it move",
    body: "Mood, sleep and energy tracked over weeks. Progress you can see on the days you can't feel it.",
    tone: "grow" as const,
  },
];

export function HowItWorks() {
  const toneRing = {
    brand: "from-brand-500 to-brand-400",
    calm: "from-calm-500 to-calm-400",
    grow: "from-grow-500 to-grow-400",
  };

  return (
    <section id="how" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="Three things, done consistently"
          subtitle="It works because it's small enough to actually keep doing."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <Card interactive className="card-lit group h-full p-8">
                <span
                  className={cn(
                    "grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br text-white shadow-[var(--shadow-soft)] transition-transform duration-300 group-hover:scale-110",
                    toneRing[step.tone],
                  )}
                >
                  <step.icon className="h-6 w-6" />
                </span>
                <p className="mt-6 text-xs font-bold uppercase tracking-widest text-subtle">
                  Step {i + 1}
                </p>
                <h3 className="mt-2 font-display text-2xl">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{step.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="What's inside"
          title="A whole toolkit, in one calm place"
          subtitle="Free while you need it. Premium when you want the deeper work."
        />

        {/* Bento — mixed tile sizes rather than a uniform grid */}
        <div className="bento mt-16">
          <Reveal className="bento-2 bento-tall">
            <Card className="card-lit grain relative h-full overflow-hidden p-8 text-white" style={{ backgroundImage: "linear-gradient(150deg, #6c63ff, #3a90f5)" }}>
              <MessageCircleHeart className="h-8 w-8" />
              <h3 className="mt-5 font-display text-3xl">An AI coach that knows when to stop</h3>
              <p className="mt-3 leading-relaxed text-white/85">
                Available at 2am when nobody else is. Warm, never clinical — and
                built to hand you to a real human the moment things get serious,
                rather than keeping you talking to software.
              </p>
              <div className="mt-6 space-y-2.5">
                {[
                  "Grounding and breathing on request",
                  "Remembers your path and phase",
                  "Crisis detection with real helplines",
                ].map((f) => (
                  <p key={f} className="flex items-center gap-2 text-sm text-white/90">
                    <Check className="h-4 w-4 shrink-0" />
                    {f}
                  </p>
                ))}
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.05} className="bento-2">
            <Card interactive className="card-lit h-full p-7">
              <Activity className="h-7 w-7 text-grow-500" />
              <h3 className="mt-4 font-display text-2xl">Track what matters</h3>
              <p className="mt-2 leading-relaxed text-muted">
                Mood, energy, stress, anxiety, confidence and sleep — in about ten
                seconds a day. Heatmaps and trend lines do the rest.
              </p>
            </Card>
          </Reveal>

          <Reveal delay={0.1} className="bento-2">
            <Card interactive className="card-lit h-full p-7">
              <NotebookPen className="h-7 w-7 text-brand-500" />
              <h3 className="mt-4 font-display text-2xl">A journal that stays private</h3>
              <p className="mt-2 leading-relaxed text-muted">
                Prompted entries, mood tagging, and lockable pages. Nothing you
                write is used to train anything.
              </p>
            </Card>
          </Reveal>

          {[
            { icon: Target, title: "Daily missions", body: "Matched to your path and phase." },
            { icon: Flower2, title: "Meditation library", body: "Filtered to what you're working on." },
            { icon: Wind, title: "Breathing pacer", body: "Paced work that lowers heart rate." },
            { icon: Users, title: "Peer support", body: "Anonymous, moderated groups." },
            { icon: Brain, title: "CBT & ACT tools", body: "Thought records, defusion, values work." },
            { icon: BookOpen, title: "Weekly reports", body: "A gentle Sunday summary." },
            { icon: Sparkles, title: "Streaks & levels", body: "Motivation without the guilt-trips." },
            { icon: Lightbulb, title: "Habit tracking", body: "The small things that compound." },
          ].map((f, i) => (
            <Reveal key={f.title} delay={0.15 + i * 0.04}>
              <Card interactive className="card-lit h-full p-6">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-bold">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{f.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const TESTIMONIALS = [
  {
    name: "Priya, 27",
    context: "Anxiety path",
    before: "I turned down anything that involved speaking. My world got very small.",
    after: "I ran a workshop last week. Still nervous, but I did it anyway.",
    avatar: "P",
    tone: "from-brand-400 to-brand-600",
  },
  {
    name: "Marcus, 34",
    context: "Burnout path",
    before: "I was working twelve-hour days and calling it normal. Sundays were dread.",
    after: "Hard stop at six. I got my evenings back and my work got better.",
    avatar: "M",
    tone: "from-warm-300 to-warm-500",
  },
  {
    name: "Sana, 22",
    context: "Sleep path",
    before: "Four hours a night for months. I genuinely thought that was just me now.",
    after: "Seven hours, most nights. Everything else got easier after that.",
    avatar: "S",
    tone: "from-calm-400 to-calm-600",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="Real journeys"
          title="What a few months looks like"
          subtitle="Composite stories from our beta community, shared with permission."
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <Card interactive className="card-lit h-full p-7">
                <Quote className="h-7 w-7 text-brand-200 dark:text-brand-800" />

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-soft-50 p-4 dark:bg-soft-950/30">
                    <p className="text-[0.6875rem] font-bold uppercase tracking-widest text-soft-500">
                      Before
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      &ldquo;{t.before}&rdquo;
                    </p>
                  </div>
                  <div className="rounded-2xl bg-grow-50 p-4 dark:bg-grow-950/30">
                    <p className="text-[0.6875rem] font-bold uppercase tracking-widest text-grow-600 dark:text-grow-400">
                      After
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed">
                      &ldquo;{t.after}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 border-t border-[var(--border)] pt-5">
                  <span
                    className={cn(
                      "grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br font-bold text-white",
                      t.tone,
                    )}
                    aria-hidden="true"
                  >
                    {t.avatar}
                  </span>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-subtle">{t.context}</p>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const PLANS = [
  {
    name: "Free",
    price: "£0",
    cadence: "forever",
    pitch: "One full programme, start to finish.",
    features: [
      "Any one path, all phases",
      "Daily missions",
      "Mood tracking",
      "Private journal",
      "3 meditations",
      "Community access",
    ],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Premium",
    price: "£8",
    cadence: "per month",
    pitch: "All six paths, and the deeper tools.",
    features: [
      "Everything in Free",
      "All six paths at once",
      "Unlimited AI coach",
      "Full meditation library",
      "Advanced analytics & weekly reports",
      "CBT and ACT exercise library",
      "Data export",
    ],
    cta: "Start 7-day trial",
    featured: true,
  },
  {
    name: "Lifetime",
    price: "£129",
    cadence: "once",
    pitch: "Pay once. Come back whenever you need it.",
    features: [
      "Everything in Premium",
      "Lifetime access",
      "All future programmes",
      "Priority support",
    ],
    cta: "Get lifetime",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Support shouldn't be paywalled"
          subtitle="One complete programme is free, permanently. Premium funds the work."
        />

        <div className="mt-16 grid items-start gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.1}>
              <Card
                className={cn(
                  "card-lit relative h-full p-8",
                  plan.featured &&
                    "border-brand-300 shadow-[var(--shadow-lift)] lg:-mt-4 lg:pb-12 dark:border-brand-700",
                )}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge tone="brand" className="shadow-[var(--shadow-soft)]">
                      Most chosen
                    </Badge>
                  </span>
                )}

                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted">{plan.pitch}</p>

                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl">{plan.price}</span>
                  <span className="text-sm text-subtle">{plan.cadence}</span>
                </p>

                <Link href="/onboarding" className="mt-6 block">
                  <Button
                    className="w-full"
                    variant={plan.featured ? "primary" : "secondary"}
                  >
                    {plan.cta}
                  </Button>
                </Link>

                <ul className="mt-7 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-grow-500" />
                      <span className="leading-relaxed text-muted">{f}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-10 text-center text-sm text-subtle">
            If you can&rsquo;t afford Premium and need it, email us. We give it away, no questions asked.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function CrisisBanner() {
  return (
    <section className="pb-8">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Card className="flex flex-col items-start gap-5 border-soft-200 bg-soft-50 p-7 sm:flex-row sm:items-center dark:border-soft-900 dark:bg-soft-950/30">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-soft-100 text-soft-600 dark:bg-soft-900/60 dark:text-soft-300">
            <ShieldAlert className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <h3 className="font-bold">If you&rsquo;re in crisis, please don&rsquo;t use an app</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              HealMind is a self-help tool, not a substitute for professional care or
              emergency services. If you&rsquo;re thinking about harming yourself, talk to
              a person now — free, 24/7, and confidential.
            </p>
          </div>
          <Link href="/crisis" className="shrink-0">
            <Button variant="danger">Get help now</Button>
          </Link>
        </Card>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { label: "Programmes", href: "#paths" },
      { label: "How it works", href: "#how" },
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Crisis help", href: "/crisis" },
      { label: "Community", href: "/community" },
      { label: "Support", href: "/support" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-2xl gradient-brand text-white">
                <CloudMoon className="h-5 w-5" />
              </span>
              <span className="text-lg font-extrabold tracking-tight">HealMind</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Structured mental health programmes built with psychologists, and
              designed to be gentle enough to use on your worst day.
            </p>
            <p className="mt-5 text-xs text-subtle">healmine.app</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {FOOTER_LINKS.map((group) => (
              <div key={group.heading}>
                <p className="text-xs font-bold uppercase tracking-widest text-subtle">
                  {group.heading}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-muted transition-colors hover:text-[var(--text)]"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-[var(--border)] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-subtle">
            © 2026 HealMind. Not a medical device. Not a substitute for therapy.
          </p>
          <p className="text-xs text-subtle">
            In an emergency call 999 (UK) or 988 (US).
          </p>
        </div>
      </div>
    </footer>
  );
}
