import {
  Annoyed,
  Bird,
  CloudSun,
  Compass,
  Droplet,
  Flame,
  Footprints,
  Frown,
  Ghost,
  Heart,
  Laugh,
  Meh,
  Moon,
  Mountain,
  NotebookPen,
  Smile,
  SmilePlus,
  Sparkles,
  Sprout,
  Sunrise,
  Waves,
  Wind,
  type LucideIcon,
} from "lucide-react";

/**
 * Every icon used to represent a domain concept (a path, a mood, a habit, an
 * achievement) goes through this registry rather than storing a component
 * reference directly on the data. `types.ts` is the seam for a future
 * backend — a real API returns a string key like "waves", not a React
 * component — so the domain models (Path, MoodOption, Habit, Achievement)
 * store an `IconKey` and only the render layer resolves it to a component.
 */
export const ICONS = {
  waves: Waves,
  flame: Flame,
  sprout: Sprout,
  moon: Moon,
  sparkles: Sparkles,
  heart: Heart,
  frown: Frown,
  annoyed: Annoyed,
  ghost: Ghost,
  smile: Smile,
  "smile-plus": SmilePlus,
  "cloud-sun": CloudSun,
  laugh: Laugh,
  wind: Wind,
  footprints: Footprints,
  droplet: Droplet,
  "notebook-pen": NotebookPen,
  bird: Bird,
  compass: Compass,
  mountain: Mountain,
  sunrise: Sunrise,
  meh: Meh,
} satisfies Record<string, LucideIcon>;

export type IconKey = keyof typeof ICONS;
