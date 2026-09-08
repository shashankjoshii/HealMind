import type { CoachSlice, SliceCreator } from "../types";

const MAX_CONVERSATION = 100;

export const createCoachSlice: SliceCreator<CoachSlice> = (set) => ({
  conversation: [],
  coachMemory: {
    turnCount: 0,
    lastIntent: null,
    intentCounts: {},
    pendingFlow: null,
    flowStep: 0,
    flowData: {},
    usedTemplateIds: [],
  },

  addMessage: (message) => {
    set((state) => ({
      conversation: [...state.conversation, message].slice(-MAX_CONVERSATION),
    }));
  },

  setCoachMemory: (patch) => {
    set((state) => ({ coachMemory: { ...state.coachMemory, ...patch } }));
  },

  resetConversation: () => {
    set({
      conversation: [],
      coachMemory: {
        turnCount: 0,
        lastIntent: null,
        intentCounts: {},
        pendingFlow: null,
        flowStep: 0,
        flowData: {},
        usedTemplateIds: [],
      },
    });
  },
});
