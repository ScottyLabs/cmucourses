import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  addToSet,
  getCalendarColor,
  removeFromSet,
  sessionToString,
} from "./utils";
import { Session } from "./types";
import { v4 as uuidv4 } from "uuid";
import { RootState } from "./store";
import type { SharedScheduleData } from "./scheduleSharing";

export interface CourseSessions {
  [courseID: string]: {
    [sessionType: string]: string;
    Color: string;
  };
}

export interface HoverSession {
  courseID: string;
  [sessionType: string]: string;
}

export interface UserSchedule {
  name: string;
  courses: string[];
  selected: string[];
  id: string;
  session: Session;
  courseSessions: CourseSessions;
  numColors: number;
  hoverSession?: HoverSession;
  /** Set when this schedule came from the Generate panel, for a "why" badge. Absent otherwise. */
  generated?: { score: number; reasons: string[] };
}

export interface UserSchedulesState {
  active: string | null;
  saved: { [id: string]: UserSchedule };
}

const initialState: UserSchedulesState = {
  active: null,
  saved: {},
};

const getNewUserSchedule = (courseIDs: string[], id: string): UserSchedule => {
  return {
    name: "My Schedule",
    courses: courseIDs,
    selected: courseIDs,
    id: id,
    session: {
      year: "",
      semester: "",
    },
    courseSessions: courseIDs.reduce(
      (acc: CourseSessions, courseID, i: number) => {
        acc[courseID] = {
          Lecture: "",
          Section: "",
          Color: getCalendarColor(i),
        };
        return acc;
      },
      {}
    ),
    numColors: courseIDs.length,
  };
};

/**
 * Resolves the active schedule, rebuilding schedules that were persisted
 * before courseSessions existed. Returns undefined when nothing is active, or
 * when active points at a schedule that is no longer saved.
 */
const getActiveSchedule = (
  state: UserSchedulesState
): UserSchedule | undefined => {
  if (state.active === null) return undefined;
  const schedule = state.saved[state.active];
  if (!schedule) return undefined;
  if (!schedule.courseSessions) {
    const rebuilt = getNewUserSchedule(schedule.courses, state.active);
    state.saved[state.active] = rebuilt;
    return rebuilt;
  }
  return schedule;
};

export const userSchedulesSlice = createSlice({
  name: "userSchedules",
  initialState,
  reducers: {
    changeActiveSchedule: (state, action: PayloadAction<string>) => {
      state.active = action.payload;
    },
    addCourseToActiveSchedule: (state, action: PayloadAction<string>) => {
      if (state.active === null || !state.saved[state.active]) {
        const newId = uuidv4();
        state.saved[newId] = getNewUserSchedule([], newId);
        state.active = newId;
      }

      const schedule = getActiveSchedule(state);
      if (!schedule) return;

      schedule.courses = addToSet(schedule.courses, action.payload);
      schedule.selected = addToSet(schedule.selected, action.payload);
      schedule.courseSessions[action.payload] = {
        Lecture: "",
        Section: "",
        Color: getCalendarColor(schedule.numColors),
      };
      schedule.numColors += 1;
    },
    removeCourseFromActiveSchedule: (state, action: PayloadAction<string>) => {
      const schedule = getActiveSchedule(state);
      if (!schedule) return;

      schedule.courses = removeFromSet(schedule.courses, action.payload);
      schedule.selected = removeFromSet(schedule.selected, action.payload);
      delete schedule.courseSessions[action.payload];
    },
    selectCourseInActiveSchedule: (state, action: PayloadAction<string>) => {
      const schedule = getActiveSchedule(state);
      if (!schedule) return;
      schedule.selected = addToSet(schedule.selected, action.payload);
    },
    deselectCourseInActiveSchedule: (state, action: PayloadAction<string>) => {
      const schedule = getActiveSchedule(state);
      if (!schedule) return;
      schedule.selected = removeFromSet(schedule.selected, action.payload);
    },
    toggleSelectedInActiveSchedule: (state) => {
      const schedule = getActiveSchedule(state);
      if (!schedule) return;
      schedule.selected =
        schedule.selected.length > 0 ? [] : [...schedule.courses];
    },
    setActiveScheduleCourses: (state, action: PayloadAction<string[]>) => {
      const schedule = getActiveSchedule(state);
      if (!schedule) return;
      schedule.courses = action.payload;
    },
    createEmptySchedule: (state) => {
      const newId = uuidv4();
      state.saved[newId] = getNewUserSchedule([], newId);
      state.active = newId;
    },
    createSharedSchedule: (
      state,
      action: PayloadAction<SharedScheduleData | string[]>
    ) => {
      const newId = uuidv4();
      if (Array.isArray(action.payload)) {
        state.saved[newId] = getNewUserSchedule(action.payload, newId);
        state.active = newId;
        return;
      }
      state.saved[newId] = {
        ...getNewUserSchedule(action.payload.courses, newId),
        name: action.payload.name || "Shared Schedule",
        selected: action.payload.selected,
        session: action.payload.session,
        courseSessions: action.payload.courseSessions,
      };
      state.active = newId;
    },
    deleteSchedule: (state, action: PayloadAction<string>) => {
      const oldIndex = Object.keys(state.saved).indexOf(action.payload);
      delete state.saved[action.payload];
      if (state.active === action.payload) {
        const scheduleIDs = Object.keys(state.saved);
        state.active = scheduleIDs[oldIndex <= 0 ? 0 : oldIndex - 1] ?? null;
      }
    },
    updateActiveScheduleName: (state, action: PayloadAction<string>) => {
      const schedule = getActiveSchedule(state);
      if (!schedule) return;
      schedule.name = action.payload;
    },
    updateActiveScheduleSemester: (state, action: PayloadAction<Session>) => {
      const schedule = getActiveSchedule(state);
      if (!schedule) return;
      schedule.session = action.payload;
    },
    updateActiveScheduleCourseSession: (
      state,
      action: PayloadAction<{
        courseID: string;
        sessionType: string;
        session: string;
      }>
    ) => {
      const schedule = getActiveSchedule(state);
      if (!schedule) return;

      const courseSession = schedule.courseSessions[action.payload.courseID];
      if (!courseSession) return;
      courseSession[action.payload.sessionType] = action.payload.session;
    },
    setHoverSession: (
      state,
      action: PayloadAction<{ courseID: string; [sessionType: string]: string }>
    ) => {
      const schedule = getActiveSchedule(state);
      if (!schedule) return;
      schedule.hoverSession = action.payload;
    },
    clearHoverSession: (state) => {
      const schedule = getActiveSchedule(state);
      if (!schedule) return;
      schedule.hoverSession = undefined;
    },
    setActiveScheduleGeneratedMeta: (
      state,
      action: PayloadAction<{ score: number; reasons: string[] }>
    ) => {
      const schedule = getActiveSchedule(state);
      if (!schedule) return;
      schedule.generated = action.payload;
    },
  },
});

const selectActiveSchedule = (state: RootState): UserSchedule | undefined => {
  if (state.schedules.active === null) return undefined;
  return state.schedules.saved[state.schedules.active];
};

export const selectActiveUserSchedule = (
  state: RootState
): UserSchedule | undefined => selectActiveSchedule(state);

export const selectCoursesInActiveSchedule = (state: RootState): string[] => {
  return selectActiveSchedule(state)?.courses ?? [];
};

export const selectSelectedCoursesInActiveSchedule = (
  state: RootState
): string[] => {
  return selectActiveSchedule(state)?.selected ?? [];
};

export const selectSessionInActiveSchedule = (state: RootState): string => {
  const session = selectActiveSchedule(state)?.session;
  if (!session || session.semester === "") return "";
  return sessionToString(session);
};

export const selectCourseSessionsInActiveSchedule = (
  state: RootState
): CourseSessions => {
  return selectActiveSchedule(state)?.courseSessions ?? {};
};

export const selectHoverSessionInActiveSchedule = (
  state: RootState
): { courseID: string; [sessionType: string]: string } | undefined => {
  return selectActiveSchedule(state)?.hoverSession;
};

export const reducer = userSchedulesSlice.reducer;
export const {
  setHoverSession,
  clearHoverSession,
  removeCourseFromActiveSchedule,
} = userSchedulesSlice.actions;
