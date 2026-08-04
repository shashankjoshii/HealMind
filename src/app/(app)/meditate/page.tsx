"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Pause, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MEDITATIONS } from "@/lib/mock-data";
import type { Meditation } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All", "Anxiety", "Sleep", "Burnout", "Self-worth", "Low mood", "Grounding",
  "Focus", "Heartbreak",
] as const;

export default function MeditatePage() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [playing, setPlaying] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(MEDITATIONS.filter((m) => m.favorite).map((m) => m.id)),
  );

  const filtered = useMemo(
    () =>
      category === "All"
        ? MEDITATIONS
        : MEDITATIONS.filter((m) => m.category === category),
    [category],
  );

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-display-sm">Meditation</h1>
        <p className="mt-2 text-muted">
          Short sessions for the specific thing you&rsquo;re dealing with.
        </p>
      </header>

      <div className="no-scrollbar -mx-5 overflow-x-auto px-5">
        <div className="flex min-w-max gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                category === c
                  ? "gradient-brand text-white"
                  : "bg-[var(--surface-muted)] text-muted hover:text-[var(--text)]",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m, i) => (
          <MeditationCard
            key={m.id}
            meditation={m}
            index={i}
            isPlaying={playing === m.id}
            isFavorite={favorites.has(m.id)}
            onPlay={() => setPlaying(playing === m.id ? null : m.id)}
            onFavorite={() => toggleFavorite(m.id)}
          />
        ))}
      </div>
    </div>
  );
}

function MeditationCard({
  meditation,
  index,
  isPlaying,
  isFavorite,
  onPlay,
  onFavorite,
}: {
  meditation: Meditation;
  index: number;
  isPlaying: boolean;
  isFavorite: boolean;
  onPlay: () => void;
  onFavorite: () => void;
}) {
  const gradients = [
    "from-brand-400 to-brand-600",
    "from-calm-400 to-calm-600",
    "from-grow-400 to-grow-600",
    "from-warm-300 to-warm-500",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Card interactive className="overflow-hidden">
        <div
          className={cn(
            "relative grid h-36 place-items-center bg-gradient-to-br",
            gradients[index % gradients.length],
          )}
        >
          {isPlaying && (
            <span className="absolute h-24 w-24 rounded-full bg-white/25 animate-breathe" />
          )}
          <button
            onClick={onPlay}
            aria-label={isPlaying ? `Pause ${meditation.title}` : `Play ${meditation.title}`}
            className="relative grid h-14 w-14 place-items-center rounded-full bg-white/95 text-brand-600 shadow-lg transition-transform hover:scale-110"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
          </button>

          <button
            onClick={onFavorite}
            aria-label={isFavorite ? "Remove from favourites" : "Add to favourites"}
            aria-pressed={isFavorite}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/20 backdrop-blur transition-colors hover:bg-white/35"
          >
            <Heart
              className={cn("h-4 w-4 text-white", isFavorite && "fill-white")}
            />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-2">
            <Badge tone="neutral">{meditation.category}</Badge>
            <span className="text-xs font-semibold text-subtle">
              {meditation.minutes} min
            </span>
          </div>
          <h2 className="mt-3 font-bold">{meditation.title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            {meditation.description}
          </p>
          <p className="mt-3 text-xs text-subtle">Narrated by {meditation.narrator}</p>
        </div>
      </Card>
    </motion.div>
  );
}
