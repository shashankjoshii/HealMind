"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  const reduce = useReducedMotion();

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      {/* Ambient background wash */}
      <div className="pointer-events-none absolute inset-0 -z-10 gradient-warm" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full opacity-40 blur-3xl animate-breathe"
        style={{
          background:
            "radial-gradient(circle, var(--color-brand-300), transparent 68%)",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 lg:grid-cols-2 lg:gap-12 lg:px-8">
        <div>
          <motion.div {...rise(0)}>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-xs font-semibold text-brand-700 backdrop-blur dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-200">
              <Sparkles className="h-3.5 w-3.5" />
              A structured 90-day recovery programme
            </span>
          </motion.div>

          <motion.h1
            {...rise(0.08)}
            className="mt-6 text-[2.6rem] font-extrabold leading-[1.08] tracking-tight sm:text-6xl lg:text-[4.1rem]"
          >
            Healing isn&rsquo;t linear.
            <br />
            <span className="gradient-text">But you don&rsquo;t have to do it alone.</span>
          </motion.h1>

          <motion.p
            {...rise(0.16)}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
          >
            A science-backed 90-day recovery journey to help you heal from
            heartbreak, rebuild confidence, and move forward — one gentle day at
            a time.
          </motion.p>

          <motion.div {...rise(0.24)} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/onboarding">
              <Button size="lg" className="group w-full sm:w-auto">
                Start healing free
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="#journey">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Explore the journey
              </Button>
            </a>
          </motion.div>

          <motion.div
            {...rise(0.32)}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted"
          >
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-grow-500" />
              Private by default
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-grow-500" />
              No card required
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-grow-500" />
              Cancel anytime
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: reduce ? 1 : 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <ClimbIllustration />
        </motion.div>
      </div>
    </section>
  );
}

/**
 * "Climbing out of darkness into sunlight" — the hero metaphor from the brief,
 * drawn inline so it inherits theme colours and needs no image request.
 */
function ClimbIllustration() {
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <svg viewBox="0 0 420 400" className="w-full drop-shadow-2xl" role="img" aria-label="An illustration of a person climbing from shadow into sunlight at the top of a hill">
        <defs>
          <linearGradient id="sky" x1="0" y1="1" x2="0.3" y2="0">
            <stop offset="0%" stopColor="#3d359e" />
            <stop offset="45%" stopColor="#8f80ff" />
            <stop offset="78%" stopColor="#ffc871" />
            <stop offset="100%" stopColor="#fff1d4" />
          </linearGradient>
          <linearGradient id="hillBack" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4a3fc4" />
            <stop offset="100%" stopColor="#34307d" />
          </linearGradient>
          <linearGradient id="hillFront" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#251f5e" />
            <stop offset="100%" stopColor="#17133f" />
          </linearGradient>
          <radialGradient id="sunGlow">
            <stop offset="0%" stopColor="#ffe9b8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ffb547" stopOpacity="0" />
          </radialGradient>
          <clipPath id="frameClip">
            <rect x="0" y="0" width="420" height="400" rx="32" />
          </clipPath>
        </defs>

        <g clipPath="url(#frameClip)">
          <rect width="420" height="400" fill="url(#sky)" />

          {/* Sun and its halo */}
          <circle cx="300" cy="108" r="96" fill="url(#sunGlow)">
            {!reduce && (
              <animate attributeName="r" values="92;104;92" dur="7s" repeatCount="indefinite" />
            )}
          </circle>
          <circle cx="300" cy="108" r="30" fill="#fff4d6" />

          {/* Stars fading out on the dark side */}
          {[
            [42, 52, 1.6], [88, 96, 1.2], [30, 132, 1.1], [120, 44, 1.4], [66, 168, 1],
          ].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="#fff" opacity="0.75">
              {!reduce && (
                <animate
                  attributeName="opacity"
                  values="0.2;0.85;0.2"
                  dur={`${3 + i * 0.7}s`}
                  repeatCount="indefinite"
                />
              )}
            </circle>
          ))}

          {/* Distant hill */}
          <path d="M-20 300 Q 90 190 210 248 Q 320 300 440 214 L440 400 L-20 400 Z" fill="url(#hillBack)" />
          {/* Foreground hill the figure climbs */}
          <path d="M-20 356 Q 110 250 236 296 Q 350 338 440 286 L440 400 L-20 400 Z" fill="url(#hillFront)" />

          {/* Climbing figure, cresting the ridge into the light */}
          <g transform="translate(214 236)">
            {!reduce && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="214 240; 214 232; 214 240"
                dur="6s"
                repeatCount="indefinite"
                additive="sum"
              />
            )}
            <circle cx="0" cy="-26" r="9.5" fill="#ffd9a8" />
            <path d="M0 -16 L0 6" stroke="#ffd9a8" strokeWidth="9" strokeLinecap="round" />
            {/* Arm reaching toward the sun */}
            <path d="M0 -10 L15 -27" stroke="#ffd9a8" strokeWidth="6.5" strokeLinecap="round" />
            <path d="M0 -8 L-12 2" stroke="#ffd9a8" strokeWidth="6.5" strokeLinecap="round" />
            <path d="M0 5 L-9 24" stroke="#6c63ff" strokeWidth="7.5" strokeLinecap="round" />
            <path d="M0 5 L11 23" stroke="#6c63ff" strokeWidth="7.5" strokeLinecap="round" />
          </g>

          {/* Rising motes of light */}
          {!reduce &&
            [
              [150, 330, 4.5], [268, 344, 5.5], [196, 356, 6.5], [316, 322, 5],
            ].map(([cx, cy, dur], i) => (
              <circle key={i} cx={cx} cy={cy} r="2.6" fill="#ffe9b8" opacity="0">
                <animate attributeName="cy" values={`${cy};${cy - 120}`} dur={`${dur}s`} repeatCount="indefinite" begin={`${i * 1.3}s`} />
                <animate attributeName="opacity" values="0;0.9;0" dur={`${dur}s`} repeatCount="indefinite" begin={`${i * 1.3}s`} />
              </circle>
            ))}
        </g>
      </svg>

      {/* Floating stat cards — social proof without a testimonial wall */}
      <motion.div
        className="absolute -left-4 top-1/3 hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-lift)] sm:block"
        animate={reduce ? {} : { y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="text-xs text-subtle">Day 34 of 90</p>
        <p className="text-sm font-bold">You&rsquo;re past the hardest part</p>
      </motion.div>

      <motion.div
        className="absolute -right-2 bottom-10 hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-lift)] sm:block"
        animate={reduce ? {} : { y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <p className="text-xs text-subtle">Mood this week</p>
        <p className="text-sm font-bold text-grow-600 dark:text-grow-400">↑ 22% steadier</p>
      </motion.div>
    </div>
  );
}
