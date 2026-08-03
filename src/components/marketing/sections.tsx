"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity, Award, BookOpen, Brain, Check, CloudMoon, Compass, Flower2,
  HeartHandshake, Lightbulb, MessageCircleHeart, Moon, NotebookPen, Quote,
  ShieldAlert, Sparkles, Target, Users, Wind,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PHASES } from "@/lib/mock-data";
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
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-[2.75rem] sm:leading-[1.14]">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-lg leading-relaxed text-muted">{subtitle}</p>}
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */

const STEPS = [
  {
    icon: Brain,
    title: "Understand your emotions",
    body: "Start with a short assessment that maps where you actually are — not where you think you should be. You get a recovery baseline and a plan built around it.",
    tone: "brand" as const,
  },
  {
    icon: Target,
    title: "Build healthy habits",
    body: "Each day gives you one focused mission: a reflection, a CBT exercise, a breathing practice. Fifteen minutes, not two hours.",
    tone: "calm" as const,
  },
  {
    icon: Flower2,
    title: "Become emotionally stronger",
    body: "Watch your mood, sleep and confidence data move over weeks. Progress you can see on the days you can't feel it.",
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
          subtitle="No 40-step system. The programme works because it's small enough to actually do on a bad day."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <Card interactive className="group h-full p-8">
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
                <h3 className="mt-2 text-xl font-bold">{step.title}</h3>
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

const FEATURES = [
  { icon: Target, title: "Daily healing missions", body: "One focused task a day, matched to your current phase." },
  { icon: Activity, title: "Mood tracking", body: "Mood, energy, stress, anxiety and confidence in ten seconds." },
  { icon: NotebookPen, title: "Private journal", body: "Encrypted entries with mood tagging and lockable pages." },
  { icon: MessageCircleHeart, title: "AI emotional coach", body: "A warm, always-available space to think out loud at 2am." },
  { icon: Users, title: "Peer support", body: "Anonymous, moderated groups with people at your stage." },
  { icon: Flower2, title: "Meditation library", body: "Guided sessions for heartbreak, sleep, anxiety and self-worth." },
  { icon: Wind, title: "Breathing exercises", body: "Paced breathing that actually lowers your heart rate." },
  { icon: Activity, title: "Recovery analytics", body: "See the trend line under the noise of individual days." },
  { icon: Sparkles, title: "Daily affirmations", body: "Grounded, non-cringe reminders that hold up on hard days." },
  { icon: HeartHandshake, title: "Relationship reflection", body: "Structured work on what happened and what it taught you." },
  { icon: ShieldAlert, title: "Trigger management", body: "Name your triggers and build a plan for each one." },
  { icon: Moon, title: "Sleep tracking", body: "Because nothing else improves until sleep does." },
  { icon: Lightbulb, title: "Gratitude journal", body: "A two-minute practice with outsized evidence behind it." },
  { icon: BookOpen, title: "Weekly reports", body: "A gentle Sunday summary of how the week actually went." },
  { icon: Compass, title: "Personal growth goals", body: "Set what you're building toward beyond just 'getting over it'." },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="Everything included"
          title="A whole toolkit, in one calm place"
          subtitle="Free while you need it. Premium when you want the deeper work."
        />

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={Math.min(i * 0.04, 0.4)}>
              <Card
                interactive
                className="group flex h-full items-start gap-4 p-6"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-100 text-brand-600 transition-colors duration-300 group-hover:bg-brand-500 group-hover:text-white dark:bg-brand-900/40 dark:text-brand-300">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{f.body}</p>
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

export function JourneyTimeline() {
  const [active, setActive] = useState(0);
  const phase = PHASES[active];

  return (
    <section id="journey" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="The 90 days"
          title="Six phases, ninety days, one direction"
          subtitle="Each phase builds on the last. You can see exactly what's coming — no mystery, no gimmicks."
        />

        <Reveal className="mt-16">
          {/* Phase selector rail */}
          <div className="no-scrollbar -mx-5 overflow-x-auto px-5 pb-2">
            <div className="flex min-w-max gap-2.5">
              {PHASES.map((p, i) => (
                <button
                  key={p.key}
                  onClick={() => setActive(i)}
                  aria-pressed={i === active}
                  className={cn(
                    "rounded-2xl border px-5 py-3 text-left transition-all duration-300",
                    i === active
                      ? "border-transparent text-white shadow-[var(--shadow-lift)]"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]",
                  )}
                  style={i === active ? { backgroundColor: p.color } : undefined}
                >
                  <span
                    className={cn(
                      "block text-[0.6875rem] font-bold uppercase tracking-widest",
                      i === active ? "text-white/75" : "text-subtle",
                    )}
                  >
                    Days {p.startDay}–{p.endDay}
                  </span>
                  <span className="block text-[0.9375rem] font-bold">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Progress track */}
          <div className="relative mt-8 h-2.5 overflow-hidden rounded-full bg-[var(--surface-inset)]">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: phase.color }}
              animate={{ width: `${(phase.endDay / 90) * 100}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* Active phase detail */}
          <motion.div
            key={phase.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="mt-8 overflow-hidden">
              <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.3fr_1fr]">
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: phase.color }}
                    />
                    <span className="text-xs font-bold uppercase tracking-widest text-subtle">
                      Phase {active + 1} · {phase.tagline}
                    </span>
                  </div>
                  <h3 className="mt-3 text-3xl font-extrabold">{phase.name}</h3>
                  <p className="mt-4 text-lg leading-relaxed text-muted">
                    {phase.description}
                  </p>
                </div>

                <div className="rounded-3xl bg-[var(--surface-muted)] p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-subtle">
                    What you&rsquo;ll do
                  </p>
                  <ul className="mt-4 space-y-3">
                    {PHASE_ACTIVITIES[phase.key].map((a) => (
                      <li key={a} className="flex items-start gap-2.5 text-sm">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0"
                          style={{ color: phase.color }}
                        />
                        <span className="leading-relaxed">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

const PHASE_ACTIVITIES: Record<string, string[]> = {
  detox: [
    "Set up a no-contact plan you can actually keep",
    "Clear the digital triggers — mute, archive, unfollow",
    "Nightly wind-down to get sleep back on track",
    "Name the feelings without acting on them",
  ],
  acceptance: [
    "Write the honest version of the relationship",
    "Challenge the 'if only I had…' loop with CBT",
    "Separate grief for them from grief for the future you pictured",
    "Sit with anger without letting it drive",
  ],
  selfcare: [
    "Rebuild a sleep, food and movement baseline",
    "Practise self-compassion in your own words",
    "Reconnect with two people you've gone quiet on",
    "Do one thing purely because you enjoy it",
  ],
  identity: [
    "List what you gave up and choose what to take back",
    "Revisit an interest that predates the relationship",
    "Redesign your space so it feels like yours",
    "Write who you are outside of being someone's partner",
  ],
  growth: [
    "Learn your attachment style and what it costs you",
    "Map the pattern across past relationships",
    "Draft boundaries you'll hold next time",
    "Forgiveness work — for them, and for yourself",
  ],
  forward: [
    "Review 90 days of your own data",
    "Write a closing letter you never send",
    "Set what you're moving toward, not away from",
    "Decide what dating again looks like on your terms",
  ],
};

/* ------------------------------------------------------------------ */

const TESTIMONIALS = [
  {
    name: "Priya, 27",
    context: "4-year relationship",
    before: "I checked his Instagram forty times a day and cried at my desk.",
    after: "I haven't looked in two months. I got my job performance back.",
    avatar: "P",
    tone: "from-brand-400 to-brand-600",
  },
  {
    name: "Marcus, 34",
    context: "Divorce after 9 years",
    before: "I genuinely thought I'd never feel normal again. I stopped sleeping.",
    after: "Sleeping seven hours. Cooking again. It got quieter, like they said.",
    avatar: "M",
    tone: "from-calm-400 to-calm-600",
  },
  {
    name: "Sana, 22",
    context: "Situationship, 8 months",
    before: "Everyone said it 'wasn't even a real relationship' so I felt stupid.",
    after: "This was the first thing that took it seriously. That mattered most.",
    avatar: "S",
    tone: "from-grow-400 to-grow-600",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="Real journeys"
          title="Ninety days looks like this"
          subtitle="Composite stories from our beta community, shared with permission."
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <Card interactive className="h-full p-7">
                <Quote className="h-7 w-7 text-brand-200 dark:text-brand-800" />

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-soft-50 p-4 dark:bg-soft-950/30">
                    <p className="text-[0.6875rem] font-bold uppercase tracking-widest text-soft-500">
                      Day 1
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      &ldquo;{t.before}&rdquo;
                    </p>
                  </div>
                  <div className="rounded-2xl bg-grow-50 p-4 dark:bg-grow-950/30">
                    <p className="text-[0.6875rem] font-bold uppercase tracking-widest text-grow-600 dark:text-grow-400">
                      Day 90
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
    pitch: "Everything you need to start today.",
    features: [
      "Full 90-day roadmap",
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
    pitch: "The deeper work, with guidance.",
    features: [
      "Everything in Free",
      "Unlimited AI coach",
      "Full meditation library",
      "Advanced analytics & weekly reports",
      "CBT and ACT exercise library",
      "Voice notes & photo memories",
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
          title="Healing shouldn't be paywalled"
          subtitle="The core 90-day programme is free, permanently. Premium funds the work."
        />

        <div className="mt-16 grid items-start gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.1}>
              <Card
                className={cn(
                  "relative h-full p-8",
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
                  <span className="text-4xl font-extrabold tracking-tight">
                    {plan.price}
                  </span>
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
      { label: "How it works", href: "#how" },
      { label: "Features", href: "#features" },
      { label: "The 90 days", href: "#journey" },
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
              A structured 90-day recovery programme for heartbreak. Built with
              psychologists, designed to be gentle enough to use on your worst day.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 text-xs text-subtle">
              <Award className="h-4 w-4" />
              healmine.app
            </p>
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
