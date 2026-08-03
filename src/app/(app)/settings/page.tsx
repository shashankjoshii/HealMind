"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Moon, Shield, Sun, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";
import { USER } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="font-semibold">{label}</p>
        {description && (
          <p className="mt-0.5 text-sm leading-relaxed text-muted">{description}</p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-brand-500" : "bg-[var(--surface-inset)]",
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    dailyMission: true,
    moodReminder: true,
    journalNudge: false,
    weeklyReport: true,
    communityReplies: false,
  });
  const [privacy, setPrivacy] = useState({
    lockJournal: true,
    anonymousCommunity: true,
    analyticsOptIn: false,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Settings
        </h1>
        <p className="mt-2 text-muted">Your account, your data, your rules.</p>
      </header>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full gradient-brand text-xl font-bold text-white">
            {USER.name[0]}
          </span>
          <div>
            <p className="text-lg font-bold">{USER.name}</p>
            <p className="text-sm text-subtle">
              Joined {new Date(USER.joinedOn).toLocaleDateString("en-GB", { month: "long", year: "numeric" })} · Day {USER.currentDay}
            </p>
          </div>
          <Badge tone="brand" className="ml-auto">Free plan</Badge>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-bold">Appearance</h2>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="font-semibold">Theme</p>
            <p className="mt-0.5 text-sm text-muted">
              Dark mode is easier on the eyes at 2am.
            </p>
          </div>
          <Button variant="secondary" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light" : "Dark"}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-bold">Notifications</h2>
        <p className="mt-1 text-sm text-muted">
          Gentle by default. Nothing guilt-trips you for missing a day.
        </p>
        <div className="mt-2 divide-y divide-[var(--border)]">
          <Toggle label="Daily mission reminder" description="One nudge in the morning." checked={notifications.dailyMission} onChange={(v) => setNotifications((n) => ({ ...n, dailyMission: v }))} />
          <Toggle label="Mood check-in" description="An evening prompt to log how the day went." checked={notifications.moodReminder} onChange={(v) => setNotifications((n) => ({ ...n, moodReminder: v }))} />
          <Toggle label="Journal nudge" checked={notifications.journalNudge} onChange={(v) => setNotifications((n) => ({ ...n, journalNudge: v }))} />
          <Toggle label="Weekly report" description="A Sunday summary of your week." checked={notifications.weeklyReport} onChange={(v) => setNotifications((n) => ({ ...n, weeklyReport: v }))} />
          <Toggle label="Community replies" checked={notifications.communityReplies} onChange={(v) => setNotifications((n) => ({ ...n, communityReplies: v }))} />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="flex items-center gap-2 font-bold">
          <Shield className="h-4 w-4" />
          Privacy
        </h2>
        <div className="mt-2 divide-y divide-[var(--border)]">
          <Toggle label="Require unlock for journal" description="Ask for your device passcode before showing entries." checked={privacy.lockJournal} onChange={(v) => setPrivacy((p) => ({ ...p, lockJournal: v }))} />
          <Toggle label="Stay anonymous in community" description="Post under a generated username only." checked={privacy.anonymousCommunity} onChange={(v) => setPrivacy((p) => ({ ...p, anonymousCommunity: v }))} />
          <Toggle label="Share anonymised usage data" description="Off by default. Helps improve the programme; never includes journal content." checked={privacy.analyticsOptIn} onChange={(v) => setPrivacy((p) => ({ ...p, analyticsOptIn: v }))} />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-bold">Your data</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Everything you&rsquo;ve written belongs to you. Export it whenever you
          like, in a format you can actually read.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary">
            <Download className="h-4 w-4" />
            Export my data
          </Button>
          <Link href="/crisis">
            <Button variant="ghost">Crisis resources</Button>
          </Link>
        </div>
      </Card>

      <Card className="border-soft-200 p-6 dark:border-soft-900">
        <h2 className="font-bold text-soft-600 dark:text-soft-400">Delete account</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Permanently removes your journal, mood history and progress. This
          can&rsquo;t be undone, and we don&rsquo;t keep a backup copy.
        </p>
        <Button variant="danger" className="mt-4">
          <Trash2 className="h-4 w-4" />
          Delete my account
        </Button>
      </Card>
    </div>
  );
}
