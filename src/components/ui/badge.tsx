import { cn } from "@/lib/utils";

type Tone = "brand" | "calm" | "grow" | "warm" | "soft" | "neutral";

const tones: Record<Tone, string> = {
  brand: "bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-200",
  calm: "bg-calm-100 text-calm-700 dark:bg-calm-900/50 dark:text-calm-200",
  grow: "bg-grow-100 text-grow-700 dark:bg-grow-900/50 dark:text-grow-200",
  warm: "bg-warm-100 text-warm-800 dark:bg-warm-900/50 dark:text-warm-200",
  soft: "bg-soft-100 text-soft-700 dark:bg-soft-900/50 dark:text-soft-200",
  neutral:
    "bg-[var(--surface-inset)] text-[var(--text-muted)]",
};

export function Badge({
  className,
  tone = "brand",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
