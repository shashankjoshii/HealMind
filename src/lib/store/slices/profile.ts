import { PATH_BY_KEY } from "@/lib/paths";
import { todayKey } from "@/lib/utils";
import type { ProfileSlice, SliceCreator } from "../types";

const XP_PER_LEVEL = 500;

export const createProfileSlice: SliceCreator<ProfileSlice> = (set, get) => ({
  profile: {
    name: "Alex",
    activePath: "anxiety",
    enrolledPaths: ["anxiety"],
    xp: 0,
    level: 1,
    streak: 0,
    longestStreak: 0,
    joinedOn: todayKey(),
  },
  programmes: {},
  achievements: [],

  enrol: (path) => {
    set((state) => {
      if (state.profile.enrolledPaths.includes(path)) return state;

      const isSecondPath = state.profile.enrolledPaths.length === 1;
      const explorer = state.achievements.find((a) => a.id === "a6");
      const unlockExplorer = isSecondPath && explorer && explorer.unlockedOn === null;

      return {
        profile: {
          ...state.profile,
          enrolledPaths: [...state.profile.enrolledPaths, path],
        },
        programmes: {
          ...state.programmes,
          [path]: {
            path,
            startedOn: todayKey(),
            currentDay: 1,
            completedDays: [],
            completedDates: [],
          },
        },
        achievements: unlockExplorer
          ? state.achievements.map((a) =>
              a.id === "a6"
                ? { ...a, unlockedOn: state.programmes[state.profile.activePath]?.currentDay ?? 1 }
                : a,
            )
          : state.achievements,
      };
    });
  },

  switchPath: (path) => {
    if (!PATH_BY_KEY[path]) return;
    if (!get().profile.enrolledPaths.includes(path)) {
      get().enrol(path); // guarantees state.programmes[path] exists below
    }
    set((state) => ({ profile: { ...state.profile, activePath: path } }));
  },

  awardXp: (amount) => {
    set((state) => {
      const xp = state.profile.xp + amount;
      const level = Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
      return { profile: { ...state.profile, xp, level } };
    });
  },
});
