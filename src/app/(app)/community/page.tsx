import type { Metadata } from "next";
import { Flag, MessageCircle, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Community" };

const GROUPS = [
  { name: "First 30 days", members: 4218, active: true, description: "For anyone just starting, on any path." },
  { name: "Anxiety & overthinking", members: 6102, active: true, description: "Racing thoughts, avoidance, and the 3am spiral." },
  { name: "Burnout & work stress", members: 2984, active: false, description: "Boundaries, recovery, and workplaces that take too much." },
  { name: "Sleep", members: 1876, active: true, description: "For anyone doing the hard early weeks of CBT-I." },
  { name: "Self-esteem", members: 2431, active: false, description: "Quieting the inner critic, and taking up space." },
  { name: "Heartbreak", members: 3102, active: false, description: "Breakups, divorce, and situationships that still hurt." },
];

const THREADS = [
  { author: "quiet_river", group: "Sleep", title: "Day 12 of sleep restriction and I finally slept through", replies: 47, hours: 2, tone: "calm" as const },
  { author: "amber_finch", group: "Anxiety & overthinking", title: "How do you stop replaying conversations at 2am?", replies: 89, hours: 5, tone: "brand" as const },
  { author: "north_wind", group: "Burnout & work stress", title: "Told my manager no for the first time in four years", replies: 134, hours: 9, tone: "warm" as const },
  { author: "small_bird", group: "Self-esteem", title: "Does the imposter feeling ever actually go away?", replies: 126, hours: 14, tone: "grow" as const },
];

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-display-sm">
            Community
          </h1>
          <p className="mt-2 text-muted">
            Anonymous, moderated, and full of people at the same point as you.
          </p>
        </div>
        <Button>
          <MessageCircle className="h-4 w-4" />
          Start a thread
        </Button>
      </header>

      <Card className="flex items-start gap-3 border-grow-200 bg-grow-50 p-5 dark:border-grow-900 dark:bg-grow-950/30">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-grow-600 dark:text-grow-400" />
        <div>
          <p className="font-bold">You&rsquo;re anonymous here</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            You post as <strong>quiet_harbour_41</strong>. Your real name is never
            shown. Every thread is moderated, and posts naming or targeting a
            specific person are removed — that protects you as much as them.
          </p>
        </div>
      </Card>

      <section>
        <h2 className="text-xl font-bold">Your groups</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((g) => (
            <Card key={g.name} interactive className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold">{g.name}</h3>
                {g.active && <Badge tone="grow">Joined</Badge>}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {g.description}
              </p>
              <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-subtle">
                <Users className="h-3.5 w-3.5" />
                {g.members.toLocaleString()} members
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Active discussions</h2>
          <Badge tone="neutral">
            <TrendingUp className="h-3 w-3" />
            Today
          </Badge>
        </div>

        <div className="mt-4 space-y-3">
          {THREADS.map((t) => (
            <Card key={t.title} interactive className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={t.tone}>{t.group}</Badge>
                    <span className="text-xs text-subtle">
                      {t.author} · {t.hours}h ago
                    </span>
                  </div>
                  <h3 className="mt-2 font-bold">{t.title}</h3>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-subtle">
                  <MessageCircle className="h-4 w-4" />
                  {t.replies}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Card className="flex items-start gap-3 p-5">
        <Flag className="mt-0.5 h-4 w-4 shrink-0 text-subtle" />
        <p className="text-sm leading-relaxed text-muted">
          Something feel wrong in a thread? Report it. Moderators review every
          report, and posts that encourage self-harm, disordered eating, or
          stopping prescribed treatment are removed on sight.
        </p>
      </Card>
    </div>
  );
}
