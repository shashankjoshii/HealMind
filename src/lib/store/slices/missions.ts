import type { Achievement } from "@/lib/types";
import { PATH_BY_KEY } from "@/lib/paths";
import { daysBetween, todayKey } from "@/lib/utils";
import type { MissionSlice, ProgrammeState, SliceCreator } from "../types";

const BASE_XP_PER_DAY = 40;

function keyFor(path: string, day: number) {
  return `${path}:${day}`;
}

/** min(totalDays, completedDays.length + 1) — progress-based, not calendar-based. See plan.md. */
function nextCurrentDay(totalDays: number, completedDays: number[]) {
  return Math.min(totalDays, completedDays.length + 1);
}

export const createMissionSlice: SliceCreator<MissionSlice> = (set, get) => ({
  missionLogs: {},

  startMission: (path, day, blockIds) => {
    const key = keyFor(path, day);
    set((state) => {
      const existing = state.missionLogs[key];
      if (existing) return state;
      return {
        missionLogs: {
          ...state.missionLogs,
          [key]: {
            path,
            day,
            blockIds,
            startedAt: new Date().toISOString(),
            completedAt: null,
            responses: {},
            xpAwarded: 0,
          },
        },
      };
    });
  },

  saveStepResponse: (path, day, stepId, text) => {
    const key = keyFor(path, day);
    set((state) => {
      const log = state.missionLogs[key];
      if (!log) return state;
      return {
        missionLogs: {
          ...state.missionLogs,
          [key]: { ...log, responses: { ...log.responses, [stepId]: text } },
        },
      };
    });
  },

  completeMission: (path, day) => {
    const key = keyFor(path, day);
    const state = get();
    const log = state.missionLogs[key];
    if (!log || log.completedAt) {
      return { xp: 0, streak: state.profile.streak, unlocked: [] };
    }

    const pathDef = PATH_BY_KEY[path];
    const programme: ProgrammeState = state.programmes[path] ?? {
      path,
      startedOn: todayKey(),
      currentDay: day,
      completedDays: [],
      completedDates: [],
    };

    const today = todayKey();
    const wasStreakBroken =
      programme.completedDates.length > 0 &&
      daysBetween(programme.completedDates[programme.completedDates.length - 1], today) > 1;

    const completedDays = programme.completedDays.includes(day)
      ? programme.completedDays
      : [...programme.completedDays, day].sort((a, b) => a - b);
    const completedDates = programme.completedDates.includes(today)
      ? programme.completedDates
      : [...programme.completedDates, today];

    const streak = wasStreakBroken ? 1 : state.profile.streak + 1;
    const longestStreak = Math.max(state.profile.longestStreak, streak);
    const xp = BASE_XP_PER_DAY + Math.round(BASE_XP_PER_DAY * Math.min(streak, 10) * 0.05);

    const updatedProgramme: ProgrammeState = {
      ...programme,
      // max(), not just nextCurrentDay(...): the demo seed intentionally has
      // a few historical gap days (see seed.ts), so completedDays.length + 1
      // can come out lower than the already-seeded currentDay. currentDay
      // must never regress regardless of how completedDays got populated.
      currentDay: pathDef
        ? Math.max(programme.currentDay, nextCurrentDay(pathDef.totalDays, completedDays))
        : programme.currentDay,
      completedDays,
      completedDates,
    };

    const unlocked: Achievement[] = [];
    const achievements = state.achievements.map((a) => {
      if (a.unlockedOn !== null) return a;

      let shouldUnlock = false;
      if (a.id === "a1" && completedDays.length === 1) shouldUnlock = true;
      if (a.id === "a2" && streak >= 7) shouldUnlock = true;
      if (a.id === "a4" && wasStreakBroken && programme.completedDays.length > 0) shouldUnlock = true;
      if (
        a.id === "a5" &&
        pathDef &&
        pathDef.phases[0] &&
        completedDays.includes(pathDef.phases[0].endDay)
      )
        shouldUnlock = true;
      if (a.id === "a7" && pathDef && day >= Math.ceil(pathDef.totalDays / 2)) shouldUnlock = true;
      if (a.id === "a8" && pathDef && completedDays.length >= pathDef.totalDays) shouldUnlock = true;

      if (!shouldUnlock) return a;
      const withUnlock = { ...a, unlockedOn: day };
      unlocked.push(withUnlock);
      return withUnlock;
    });

    set({
      missionLogs: {
        ...state.missionLogs,
        [key]: { ...log, completedAt: new Date().toISOString(), xpAwarded: xp },
      },
      programmes: { ...state.programmes, [path]: updatedProgramme },
      profile: { ...state.profile, streak, longestStreak },
      achievements,
    });
    get().awardXp(xp);

    return { xp, streak, unlocked };
  },
});
