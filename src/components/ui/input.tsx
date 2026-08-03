import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full bg-[var(--surface-muted)] border border-[var(--border)] " +
  "placeholder:text-[var(--text-subtle)] transition-colors duration-200 " +
  "focus:border-brand-400 focus:bg-[var(--surface)] focus:outline-none " +
  "focus:ring-4 focus:ring-brand-500/12 disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(base, "h-12 rounded-2xl px-4 text-[0.9375rem]", className)}
        {...props}
      />
    );
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        base,
        "min-h-32 resize-y rounded-2xl px-4 py-3 text-[0.9375rem] leading-relaxed",
        className,
      )}
      {...props}
    />
  );
});

export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="w-full">
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-subtle">{hint}</p>}
    </div>
  );
}
