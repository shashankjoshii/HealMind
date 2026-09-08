"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3, CalendarCheck, Compass, Flower2, Home, Menu, MessageCircleHeart,
  Moon, NotebookPen, Route, Settings, Smile, Sun, Users, X,
} from "lucide-react";
import { Logo } from "@/components/marketing/nav";
import { Icon } from "@/components/ui/icon";
import { useTheme } from "@/components/theme-provider";
import { PATH_BY_KEY } from "@/lib/paths";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/today", label: "Today's mission", icon: CalendarCheck },
  { href: "/mood", label: "Mood", icon: Smile },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/coach", label: "AI coach", icon: MessageCircleHeart },
  { href: "/journey", label: "Journey", icon: Route },
  { href: "/paths", label: "Programmes", icon: Compass },
  { href: "/meditate", label: "Meditate", icon: Flower2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/community", label: "Community", icon: Users },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const profile = useAppStore((s) => s.profile);
  const programmes = useAppStore((s) => s.programmes);
  const path = PATH_BY_KEY[profile.activePath];
  const currentDay = programmes[profile.activePath]?.currentDay ?? 1;

  const nav = (
    <>
      <Link href="/" className="flex items-center gap-2.5 px-3 py-1">
        <Logo />
        <span className="text-lg font-extrabold tracking-tight">HealMind</span>
      </Link>

      <nav className="mt-8 flex-1 space-y-1" aria-label="Main">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[0.9375rem] font-medium transition-colors duration-200",
                active
                  ? "bg-brand-100 font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                  : "text-muted hover:bg-[var(--surface-muted)] hover:text-[var(--text)]",
              )}
            >
              <item.icon className="h-[1.15rem] w-[1.15rem] shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-[var(--border)] pt-4">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[0.9375rem] font-medium text-muted transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
        >
          {theme === "dark" ? <Sun className="h-[1.15rem] w-[1.15rem]" /> : <Moon className="h-[1.15rem] w-[1.15rem]" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <Link
          href="/settings"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[0.9375rem] font-medium text-muted transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
        >
          <Settings className="h-[1.15rem] w-[1.15rem]" />
          Settings
        </Link>

        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[var(--surface-muted)] p-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full gradient-brand font-bold text-white">
            {profile.name[0]}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{profile.name}</p>
            <p className="flex items-center gap-1 truncate text-xs text-subtle">
              <Icon name={path.icon} className="h-3 w-3 shrink-0" />
              Day {currentDay} · Lvl {profile.level}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="glass sticky top-0 z-40 flex items-center justify-between border-b border-[var(--border)] px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="font-extrabold tracking-tight">HealMind</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="grid h-10 w-10 place-items-center rounded-xl text-muted"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-[17rem] flex-col border-r border-[var(--border)] bg-[var(--surface)] p-4">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl text-muted"
            >
              <X className="h-5 w-5" />
            </button>
            {nav}
          </div>
        </div>
      )}

      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 hidden w-[17rem] flex-col border-r border-[var(--border)] bg-[var(--surface)] p-4 lg:flex">
        {nav}
      </aside>
    </>
  );
}
