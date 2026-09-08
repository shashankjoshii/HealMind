import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Clamp a number into a range. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** Local-timezone YYYY-MM-DD. Avoids the UTC shift of toISOString(). */
export function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Today's local date key, YYYY-MM-DD. Read only in event handlers/effects, never during render. */
export function todayKey() {
  return toDateKey(new Date());
}

/** Non-cryptographic id for client-created records (journal entries, chat messages). */
export function newId() {
  return Math.random().toString(36).slice(2, 10);
}

/** Whole days between two YYYY-MM-DD date keys (b - a). */
export function daysBetween(a: string, b: string) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((Date.parse(b) - Date.parse(a)) / msPerDay);
}
