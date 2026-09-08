import type { SliceCreator, SosSlice } from "../types";

const MAX_SOS_HISTORY = 200;

export const createSosSlice: SliceCreator<SosSlice> = (set) => ({
  sosOpen: false,
  sosTool: null,
  sosStartedAt: null,
  sosHistory: [],

  openSos: (tool) => {
    set({ sosOpen: true, sosTool: tool ?? null, sosStartedAt: new Date().toISOString() });
  },

  closeSos: (outcome) => {
    set((state) => {
      const entry =
        outcome && state.sosTool
          ? [
              {
                at: new Date().toISOString(),
                tool: state.sosTool,
                seconds: outcome.seconds,
                helped: outcome.helped,
              },
            ]
          : [];
      return {
        sosOpen: false,
        sosTool: null,
        sosStartedAt: null,
        sosHistory: [...state.sosHistory, ...entry].slice(-MAX_SOS_HISTORY),
      };
    });
  },
});
