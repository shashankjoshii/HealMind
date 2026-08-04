import { Check } from "lucide-react";
import type { Habit } from "@/lib/types";
import { cn } from "@/lib/utils";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

export function HabitRow({ habit }: { habit: Habit }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--surface-muted)] text-base">
        {habit.icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{habit.name}</p>
        <p className="text-xs text-subtle">{habit.streak}-day streak</p>
      </div>

      <div className="flex gap-1">
        {habit.week.map((done, i) => (
          <span
            key={i}
            title={`${DAY_LETTERS[i]} — ${done ? "done" : "not done"}`}
            className={cn(
              "grid h-6 w-6 place-items-center rounded-lg text-[0.625rem] font-bold",
              done
                ? "bg-grow-500 text-white"
                : "bg-[var(--surface-inset)] text-[var(--text-subtle)]",
            )}
          >
            {done ? <Check className="h-3 w-3" strokeWidth={3} /> : DAY_LETTERS[i]}
          </span>
        ))}
      </div>
    </div>
  );
}
