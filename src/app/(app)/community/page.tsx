import type { Metadata } from "next";
import { Flag, MessageCircle, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Community" };

const GROUPS = [
  { name: "First 30 days", members: 2841, active: true, description: "For anyone in the Detox or Acceptance phase." },
  { name: "Divorce & separation", members: 1204, active: true, description: "Longer relationships, shared lives, legal untangling." },
  { name: "Situationships", members: 1876, active: false, description: "When it wasn't official but it still broke you." },
  { name: "Co-parenting", members: 643, active: false, description: "Healing while still in regular contact." },
  { name: "Anxious attachment", members: 3102, active: true, description: "Understanding the pull and learning to sit with it." },
  { name: "Sober & healing", members: 512, active: false, description: "Recovery from heartbreak without the drink." },
];

const THREADS = [
  { author: "quiet_river", group: "First 30 days", title: "Day 12 and I finally slept through the night", replies: 47, hours: 2, tone: "grow" as const },
  { author: "amber_finch", group: "Anxious attachment", title: "How do you stop checking if they've been online?", replies: 89, hours: 5, tone: "brand" as const },
  { author: "north_wind", group: "Divorce & separation", title: "Nobody warns you about the admin of leaving", replies: 34, hours: 9, tone: "calm" as const },
  { author: "small_bird", group: "Situationships", title: "My friends think I'm overreacting. Am I?", replies: 126, hours: 14, tone: "warm" as const },
];

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
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
            shown. Every thread is moderated, and posts naming or targeting an ex
            are removed — that protects you as much as them.
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
          report, and posts that encourage self-harm, revenge, or contacting an ex
          are removed on sight.
        </p>
      </Card>
    </div>
  );
}
