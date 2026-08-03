import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Clamp a number into a range. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** "Day 34" -> percent of the 90-day programme completed. */
export function dayToPercent(day: number, total = 90) {
  return clamp((day / total) * 100, 0, 100);
}

export function formatDay(day: number) {
  return `Day ${day}`;
}

/** Local-timezone YYYY-MM-DD. Avoids the UTC shift of toISOString(). */
export function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}
