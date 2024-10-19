import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { addToSet, removeFromSet, sessionToString } from "./utils";
import { Session } from "./types";
import { v4 as uuidv4 } from "uuid";
import { RootState } from "./store";
import { GET_CALENDAR_COLOR } from "~/app/constants";

export interface CourseSessions {
  [courseID: string]: {
    [sessionType: string]: string;
    Color: string;
  };
}

export interface UserSchedule {
  name: string;
  courses: string[];
  selected: string[];
  id: string;
  session: Session;
  courseSessions: CourseSessions;
  numColors: number;
}

export interface UserSchedulesState {
  active: string | null;
  saved: { [id: string]: UserSchedule };
}

const initialState: UserSchedulesState = {
  active: null,
  saved: {},
};

const getNewUserSchedule = (courseIDs: string[], id: string) : UserSchedule => {
  return {
    name: "My Schedule",
    courses: courseIDs,
    selected: courseIDs,
    id: id,
    session: {
      year: "",
      semester: "",
    },
    courseSessions: courseIDs.reduce((acc: CourseSessions, courseID, i: number) => {
      acc[courseID] = {Lecture: "", Section: "", Color: GET_CALENDAR_COLOR(i)};
      return acc;
    }, {}),
    numColors: courseIDs.length,
  };
}

export const userSchedulesSlice = createSlice({
  name: "userSchedules",
  initialState,
  reducers: {
    changeActiveSchedule: (state, action: PayloadAction<string>) => {
      state.active = action.payload;
    },
    addCourseToActiveSchedule: (state, action: PayloadAction<string>) => {
      if (state.active === null) {
        const newId = uuidv4();
        state.saved[newId] = getNewUserSchedule([], newId);
        state.active = newId;
      }
      state.saved[state.active].courses = addToSet(
        state.saved[state.active].courses,
        action.payload
      );
      state.saved[state.active].selected = addToSet(
        state.saved[state.active].selected,
        action.payload
      );
      state.saved[state.active].courseSessions[action.payload] = {Lecture: "", Section: "", Color: GET_CALENDAR_COLOR(state.saved[state.active].numColors)};
      state.saved[state.active].numColors += 1;
    },
    removeCourseFromActiveSchedule: (state, action: PayloadAction<string>) => {
      if (state.active === null) return;
      state.saved[state.active].courses = removeFromSet(
        state.saved[state.active].courses,
        action.payload
      );
      state.saved[state.active].selected = removeFromSet(
        state.saved[state.active].selected,
        action.payload
      );

      delete state.saved[state.active].courseSessions[action.payload];
    },
    selectCourseInActiveSchedule: (state, action: PayloadAction<string>) => {
      if (state.active === null) return;
      state.saved[state.active].selected = addToSet(
        state.saved[state.active].selected,
        action.payload
      );
    },
    deselectCourseInActiveSchedule: (state, action: PayloadAction<string>) => {
      if (state.active === null) return;
      state.saved[state.active].selected = removeFromSet(
        state.saved[state.active].selected,
        action.payload
      );
    },
    toggleSelectedInActiveSchedule: (state) => {
      if (state.active === null) return;
      if (state.saved[state.active].selected.length > 0) {
        state.saved[state.active].selected = [];
      } else {
        state.saved[state.active].selected = state.saved[state.active].courses;
      }
    },
    setActiveScheduleCourses: (state, action: PayloadAction<string[]>) => {
      if (state.active === null) return;
      state.saved[state.active].courses = action.payload;
    },
    createEmptySchedule: (state) => {
      const newId = uuidv4();
      state.saved[newId] = getNewUserSchedule([], newId);
      state.active = newId;
    },
    createSharedSchedule: (state, action: PayloadAction<string[]>) => {
      const newId = uuidv4();
      state.saved[newId] = getNewUserSchedule(action.payload, newId);
      state.active = newId;
    },
    deleteSchedule: (state, action: PayloadAction<string>) => {
      const oldIndex = Object.keys(state.saved).indexOf(action.payload);
      delete state.saved[action.payload];
      if (state.active === action.payload) {
        const scheduleIDs = Object.keys(state.saved);
        if (scheduleIDs.length === 0) {
          state.active = null;
        } else {
          state.active = scheduleIDs[oldIndex <= 0 ? 0 : oldIndex - 1];
        }
      }
    },
    updateActiveScheduleName: (state, action: PayloadAction<string>) => {
      if (state.active !== null) {
        state.saved[state.active].name = action.payload;
      }
    },
    updateActiveScheduleSession: (state, action: PayloadAction<Session>) => {
      if (state.active !== null) {
        state.saved[state.active].session = action.payload;
      }
    },
    updateActiveScheduleCourseSession: (state, action: PayloadAction<{ courseID: string, sessionType: string, session: string }>) => {
      if (state.active !== null) {
        state.saved[state.active].courseSessions[action.payload.courseID][action.payload.sessionType] = action.payload.session
      }
    },
  },
});

export const selectCoursesInActiveSchedule = (state: RootState): string[] => {
  if (state.schedules.active === null) return [];
  return state.schedules.saved[state.schedules.active].courses;
};

export const selectSelectedCoursesInActiveSchedule = (
  state: RootState
): string[] => {
  if (state.schedules.active === null) return [];
  return state.schedules.saved[state.schedules.active].selected;
};

export const selectSessionInActiveSchedule = (
  state: RootState
): string => {
  if (state.schedules.active === null) return "";
  const session = state.schedules.saved[state.schedules.active].session;
  if (session.semester === "") return "";
  return sessionToString(session);
};

export const selectCourseSessionsInActiveSchedule = (
  state: RootState
): CourseSessions => {
  if (state.schedules.active === null) return {};
  return state.schedules.saved[state.schedules.active].courseSessions;
};

export const reducer = userSchedulesSlice.reducer;
