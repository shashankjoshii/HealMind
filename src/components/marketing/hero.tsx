"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PATHS } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function Hero() {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);
  const active = PATHS[hovered ?? 0];

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      {/* Ambient mesh, retinted by whichever path is hovered. Plain CSS
          transition rather than a motion value — Framer's animate prop can't
          type custom properties, and this needs no spring physics. */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 mesh grain"
        style={
          {
            "--mesh-1": active.gradient[0],
            "--mesh-2": active.gradient[1],
            transition: "background-image 0.8s ease-out",
          } as React.CSSProperties
        }
        aria-hidden="true"
      />
      <div
        className={cn(
          "pointer-events-none absolute -top-56 left-1/2 -z-10 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full opacity-30 blur-3xl",
          !reduce && "animate-drift",
        )}
        style={{
          background: `radial-gradient(circle, ${active.gradient[0]}, transparent 68%)`,
          transition: "background 0.8s ease-out",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <motion.div {...rise(0)} className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)]/70 px-4 py-1.5 text-xs font-semibold backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-grow-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-grow-500" />
            </span>
            Six programmes. One app. Free to start.
          </span>
        </motion.div>

        <motion.h1
          {...rise(0.08)}
          className="mx-auto mt-7 max-w-4xl text-center font-display text-display-lg"
        >
          Whatever you&rsquo;re carrying,
          <br />
          <span
            className="path-text"
            style={
              {
                "--path-from": active.gradient[0],
                "--path-to": active.gradient[1],
                transition: "all 0.6s ease",
              } as React.CSSProperties
            }
          >
            there&rsquo;s a way through it.
          </span>
        </motion.h1>

        <motion.p
          {...rise(0.16)}
          className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-muted"
        >
          Structured, science-backed programmes for anxiety, burnout, low mood,
          sleep, self-esteem and heartbreak. Pick the one that sounds like you and
          start today — fifteen minutes a day, not two hours.
        </motion.p>

        <motion.div
          {...rise(0.24)}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link href="/onboarding">
            <Button size="lg" className="group w-full sm:w-auto">
              Find your path
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
          <a href="#paths">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Browse programmes
            </Button>
          </a>
        </motion.div>

        <motion.div
          {...rise(0.32)}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted"
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

        {/* Path picker rail — doubles as the hero's visual anchor */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        >
          {PATHS.map((path, i) => (
            <Link
              key={path.key}
              href="/onboarding"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              className={cn(
                "group relative overflow-hidden rounded-3xl border p-5 text-center transition-all duration-300",
                hovered === i
                  ? "-translate-y-1.5 border-transparent shadow-[var(--shadow-lift)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:-translate-y-1",
              )}
              style={
                hovered === i
                  ? {
                      backgroundImage: `linear-gradient(150deg, ${path.gradient[0]}, ${path.gradient[1]})`,
                    }
                  : undefined
              }
            >
              <span className="block text-3xl transition-transform duration-300 group-hover:scale-115">
                {path.emoji}
              </span>
              <span
                className={cn(
                  "mt-2.5 block text-[0.8125rem] font-bold leading-tight transition-colors",
                  hovered === i && "text-white",
                )}
              >
                {path.name}
              </span>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
