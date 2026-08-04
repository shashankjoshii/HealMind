import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HELPLINES, type CrisisCategory } from "@/lib/safety";

export const metadata: Metadata = {
  title: "Get help now",
  description: "Free, confidential crisis support lines available 24/7.",
};

const GROUPS: { category: CrisisCategory; heading: string; blurb: string }[] = [
  {
    category: "suicide",
    heading: "Feeling suicidal, or that you can't go on",
    blurb:
      "You do not need to be in immediate danger to call. Feeling like you can't carry it is reason enough.",
  },
  {
    category: "eating",
    heading: "Food, eating, or your body",
    blurb:
      "Disordered eating gets better with the right support, and it's more common than you'd think.",
  },
  {
    category: "abuse",
    heading: "You don't feel safe with someone",
    blurb:
      "These lines can help with safety planning, whether or not you want to leave.",
  },
];

export default function CrisisPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-14 lg:py-20">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-[var(--text)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <h1 className="mt-8 font-display text-display-sm">
        You deserve to talk to a person
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        These lines are free, confidential, and open right now.
      </p>

      <Card className="mt-8 border-soft-200 bg-soft-50 p-6 dark:border-soft-900 dark:bg-soft-950/30">
        <p className="font-bold">If you are in immediate danger</p>
        <p className="mt-1.5 leading-relaxed text-muted">
          Call your local emergency number now — <strong>999</strong> in the UK,{" "}
          <strong>911</strong> in the US, <strong>112</strong> across the EU, or go
          to your nearest emergency department.
        </p>
      </Card>

      {GROUPS.map((group) => {
        const lines = HELPLINES.filter((l) =>
          l.categories.includes(group.category),
        );
        return (
          <section key={group.category} className="mt-10">
            <h2 className="font-display text-2xl">{group.heading}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {group.blurb}
            </p>

            <div className="mt-4 space-y-3">
              {lines.map((line) => (
                <Card key={`${group.category}-${line.region}-${line.name}`} className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-widest text-subtle">
                        {line.region}
                      </p>
                      <p className="mt-1.5 text-lg font-bold">{line.name}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {line.detail}
                      </p>
                    </div>
                    {line.href ? (
                      <a
                        href={line.href}
                        target={line.href.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                      >
                        <Button variant="secondary">
                          <Phone className="h-4 w-4" />
                          {line.contact}
                        </Button>
                      </a>
                    ) : (
                      <span className="rounded-2xl bg-[var(--surface-muted)] px-4 py-2.5 text-sm font-semibold">
                        {line.contact}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        );
      })}

      <p className="mt-12 text-sm leading-relaxed text-subtle">
        HealMind is a self-help tool. It is not a medical device, not a crisis
        service, and not a substitute for professional care. If you&rsquo;re
        struggling regularly, please consider speaking to your GP or a qualified
        therapist.
      </p>
    </main>
  );
}
