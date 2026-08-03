"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Short words shown under the track, e.g. ["Drained", "Energised"]. */
  endLabels?: [string, string];
  /** Renders the current value as text, e.g. (v) => `${v}/10`. */
  format?: (value: number) => string;
  className?: string;
}

export function Slider({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  endLabels,
  format = (v) => `${v}`,
  className,
}: SliderProps) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2.5 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>
        <span className="text-sm font-bold text-brand-600 dark:text-brand-300 tabular-nums">
          {format(value)}
        </span>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="healmind-range w-full"
        style={{ "--pct": `${pct}%` } as React.CSSProperties}
      />

      {endLabels && (
        <div className="mt-1.5 flex justify-between text-xs text-subtle">
          <span>{endLabels[0]}</span>
          <span>{endLabels[1]}</span>
        </div>
      )}

      <style jsx>{`
        .healmind-range {
          appearance: none;
          -webkit-appearance: none;
          height: 10px;
          border-radius: 999px;
          background: linear-gradient(
            to right,
            var(--color-brand-500) 0%,
            var(--color-calm-400) var(--pct),
            var(--surface-inset) var(--pct),
            var(--surface-inset) 100%
          );
          cursor: pointer;
        }
        .healmind-range::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 999px;
          background: #fff;
          border: 3px solid var(--color-brand-500);
          box-shadow: 0 2px 8px rgb(16 12 40 / 0.2);
          transition: transform 0.15s ease;
        }
        .healmind-range::-webkit-slider-thumb:active {
          transform: scale(1.18);
        }
        .healmind-range::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 999px;
          background: #fff;
          border: 3px solid var(--color-brand-500);
          box-shadow: 0 2px 8px rgb(16 12 40 / 0.2);
        }
      `}</style>
    </div>
  );
}
