import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { addToSet, removeFromSet } from "./utils";
import { Session } from "./types";
import { v4 as uuidv4 } from "uuid";
import { RootState } from "./store";

export interface UserSchedule {
  name: string;
  courses: string[];
  selected: string[];
  id: string;
  session?: Session;
}

export interface UserSchedulesState {
  active: string | null;
  saved: { [id: string]: UserSchedule };
}

const initialState: UserSchedulesState = {
  active: null,
  saved: {},
};

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
        state.saved[newId] = {
          name: "My Schedule",
          courses: [],
          selected: [],
          id: newId,
        };
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
    },
    removeCourseFromActiveSchedule: (state, action: PayloadAction<string>) => {
      state.saved[state.active].courses = removeFromSet(
        state.saved[state.active].courses,
        action.payload
      );
      state.saved[state.active].selected = removeFromSet(
        state.saved[state.active].selected,
        action.payload
      );
    },
    selectCourseInActiveSchedule: (state, action: PayloadAction<string>) => {
      state.saved[state.active].selected = addToSet(
        state.saved[state.active].selected,
        action.payload
      );
    },
    deselectCourseInActiveSchedule: (state, action: PayloadAction<string>) => {
      state.saved[state.active].selected = removeFromSet(
        state.saved[state.active].selected,
        action.payload
      );
    },
    toggleSelectedInActiveSchedule: (state) => {
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
      state.saved[newId] = {
        name: "My Schedule",
        selected: [],
        courses: [],
        id: newId,
      };
      state.active = newId;
    },
    createSharedSchedule: (state, action: PayloadAction<string[]>) => {
      const newId = uuidv4();
      state.saved[newId] = {
        name: "Shared Schedule",
        selected: action.payload,
        courses: action.payload,
        id: newId,
      };
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

export const reducer = userSchedulesSlice.reducer;
