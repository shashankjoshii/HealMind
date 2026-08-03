"use client";

import { motion, useReducedMotion } from "framer-motion";
import { clamp, cn } from "@/lib/utils";

interface ProgressRingProps {
  /** 0–100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  /** Accessible description, e.g. "Recovery progress". */
  label: string;
}

export function ProgressRing({
  value,
  size = 160,
  strokeWidth = 12,
  className,
  children,
  label,
}: ProgressRingProps) {
  const reduceMotion = useReducedMotion();
  const pct = clamp(value, 0, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${Math.round(pct)}%`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-brand-500)" />
            <stop offset="55%" stopColor="var(--color-calm-400)" />
            <stop offset="100%" stopColor="var(--color-grow-400)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-inset)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: reduceMotion ? offset : circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduceMotion ? 0 : 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        {children}
      </div>
    </div>
  );
}

export function ProgressBar({
  value,
  className,
  label,
  tone = "brand",
}: {
  value: number;
  className?: string;
  label: string;
  tone?: "brand" | "grow" | "calm" | "warm";
}) {
  const pct = clamp(value, 0, 100);
  const fills = {
    brand: "gradient-brand",
    grow: "bg-grow-500",
    calm: "bg-calm-500",
    warm: "bg-warm-400",
  } as const;

  return (
    <div
      className={cn(
        "h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-inset)]",
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <motion.div
        className={cn("h-full rounded-full", fills[tone])}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
