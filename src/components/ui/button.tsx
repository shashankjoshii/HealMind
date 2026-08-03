import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "soft" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "gradient-brand text-white shadow-[var(--shadow-glow)] hover:brightness-108 active:brightness-95",
  secondary:
    "bg-[var(--surface)] text-[var(--text)] border border-[var(--border-strong)] hover:bg-[var(--surface-muted)]",
  outline:
    "border border-brand-300 text-brand-700 dark:text-brand-300 dark:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/30",
  ghost: "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]",
  soft: "bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200 hover:bg-brand-200 dark:hover:bg-brand-900/60",
  danger:
    "bg-soft-500 text-white hover:bg-soft-600 active:bg-soft-700",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-xl",
  md: "h-11 px-5 text-[0.9375rem] gap-2 rounded-2xl",
  lg: "h-14 px-7 text-base gap-2.5 rounded-3xl",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant = "primary", size = "md", ...props }, ref) {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex select-none items-center justify-center font-semibold",
          "transition-[transform,filter,background-color,color] duration-200",
          "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
