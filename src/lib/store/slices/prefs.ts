import type { PrefsSlice, SliceCreator } from "../types";

export const createPrefsSlice: SliceCreator<PrefsSlice> = (set) => ({
  prefs: {
    sound: false,
    lockJournal: true,
    anonymousCommunity: true,
    analyticsOptIn: false,
    notifications: {
      dailyMission: true,
      moodReminder: true,
      journalNudge: false,
      weeklyReport: true,
      communityReplies: false,
    },
  },

  setPref: (key, value) => {
    set((state) => ({ prefs: { ...state.prefs, [key]: value } }));
  },
});
