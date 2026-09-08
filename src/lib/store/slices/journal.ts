import { newId } from "@/lib/utils";
import type { JournalSlice, SliceCreator, StoredJournalEntry } from "../types";

export const createJournalSlice: SliceCreator<JournalSlice> = (set) => ({
  journalEntries: {},

  addEntry: (input) => {
    const entry: StoredJournalEntry = {
      ...input,
      id: newId(),
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const journalEntries = { ...state.journalEntries, [entry.id]: entry };
      const realCount = Object.values(journalEntries).filter((e) => !e.seeded).length;

      const deepDiver = state.achievements.find((a) => a.id === "a3");
      const unlock = deepDiver && deepDiver.unlockedOn === null && realCount >= 10;

      return {
        journalEntries,
        achievements: unlock
          ? state.achievements.map((a) =>
              a.id === "a3"
                ? { ...a, unlockedOn: state.programmes[state.profile.activePath]?.currentDay ?? null }
                : a,
            )
          : state.achievements,
      };
    });

    return entry;
  },

  updateEntry: (id, patch) => {
    set((state) => {
      const existing = state.journalEntries[id];
      if (!existing) return state;
      return {
        journalEntries: { ...state.journalEntries, [id]: { ...existing, ...patch } },
      };
    });
  },

  deleteEntry: (id) => {
    set((state) => {
      const journalEntries = { ...state.journalEntries };
      delete journalEntries[id];
      return { journalEntries };
    });
  },
});
