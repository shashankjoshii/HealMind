import type { MoodSlice, SliceCreator } from "../types";

export const createMoodSlice: SliceCreator<MoodSlice> = (set) => ({
  moodEntries: {},

  logMood: (entry) => {
    set((state) => ({
      moodEntries: {
        ...state.moodEntries,
        [entry.date]: { ...entry },
      },
    }));
  },
});
