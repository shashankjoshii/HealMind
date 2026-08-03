"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Plus, Search, Unlock, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { JOURNAL_ENTRIES, MOOD_BY_KEY, MOOD_OPTIONS } from "@/lib/mock-data";
import type { JournalEntry, MoodKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const PROMPTS = [
  "What did today ask of you that you didn't expect?",
  "Write the thing you'd say to them if they could hear it, knowing they can't.",
  "What's one way you were kind to yourself today?",
  "What are you afraid will still be true in a year?",
];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(JOURNAL_ENTRIES);
  const [query, setQuery] = useState("");
  const [composing, setComposing] = useState(false);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());

  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftMood, setDraftMood] = useState<MoodKey>("okay");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (!e.locked && e.body.toLowerCase().includes(q)) ||
        e.tags.some((t) => t.includes(q)),
    );
  }, [entries, query]);

  const prompt = PROMPTS[entries.length % PROMPTS.length];

  function save() {
    if (!draftBody.trim()) return;
    setEntries((prev) => [
      {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        title: draftTitle.trim() || "Untitled",
        body: draftBody.trim(),
        mood: draftMood,
        tags: [],
        locked: false,
      },
      ...prev,
    ]);
    setDraftTitle("");
    setDraftBody("");
    setDraftMood("okay");
    setComposing(false);
  }

  function toggleLock(id: string) {
    setUnlocked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Journal
          </h1>
          <p className="mt-2 text-muted">
            {entries.length} entries. Yours alone — nothing here is shared.
          </p>
        </div>
        <Button onClick={() => setComposing((v) => !v)}>
          {composing ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {composing ? "Cancel" : "New entry"}
        </Button>
      </header>

      {composing && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 sm:p-7">
            <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm italic leading-relaxed text-brand-800 dark:bg-brand-950/40 dark:text-brand-200">
              {prompt}
            </p>

            <Input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Give it a title (optional)"
              className="mt-5"
              aria-label="Entry title"
            />

            <Textarea
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              placeholder="Start anywhere. It doesn't have to be tidy."
              className="mt-3 min-h-48"
              aria-label="Entry body"
            />

            <div className="mt-5">
              <p className="mb-2.5 text-sm font-semibold">How did this feel?</p>
              <div className="flex flex-wrap gap-2">
                {MOOD_OPTIONS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setDraftMood(m.key)}
                    aria-pressed={draftMood === m.key}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-sm font-medium transition-all",
                      draftMood === m.key
                        ? "border-brand-400 bg-brand-50 dark:bg-brand-900/30"
                        : "border-transparent bg-[var(--surface-muted)]",
                    )}
                  >
                    <span>{m.emoji}</span>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Button onClick={save} disabled={!draftBody.trim()}>
                Save entry
              </Button>
              <span className="text-sm text-subtle">
                {draftBody.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your entries…"
          className="pl-11"
          aria-label="Search entries"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((entry, i) => {
          const mood = MOOD_BY_KEY[entry.mood];
          const isHidden = entry.locked && !unlocked.has(entry.id);

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-xl">{mood.emoji}</span>
                      <h2 className="text-lg font-bold">{entry.title}</h2>
                      {entry.locked && (
                        <Badge tone="neutral">
                          <Lock className="h-3 w-3" />
                          Locked
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-subtle">
                      {new Date(entry.createdAt).toLocaleString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {entry.locked && (
                    <button
                      onClick={() => toggleLock(entry.id)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--surface-muted)] text-muted transition-colors hover:text-[var(--text)]"
                      aria-label={isHidden ? "Unlock entry" : "Lock entry"}
                    >
                      {isHidden ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </button>
                  )}
                </div>

                <p
                  className={cn(
                    "mt-4 leading-relaxed text-muted transition-all",
                    isHidden && "select-none blur-sm",
                  )}
                >
                  {isHidden
                    ? "This entry is private. Unlock it to read what you wrote."
                    : entry.body}
                </p>

                {entry.tags.length > 0 && !isHidden && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {entry.tags.map((t) => (
                      <Badge key={t} tone="neutral">
                        #{t}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <Card className="p-12 text-center">
            <p className="font-semibold">Nothing matches &ldquo;{query}&rdquo;</p>
            <p className="mt-1.5 text-sm text-muted">
              Locked entries aren&rsquo;t searchable by content.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
