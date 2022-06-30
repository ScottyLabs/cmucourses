import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { addToSet, removeFromSet } from "./utils";
import { Session } from "./types";
import { v4 as uuidv4 } from "uuid";
import { RootState } from "./store";

export interface UserSchedule {
  name: string;
  courses: string[];
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
          id: newId,
        };
        state.active = newId;
      }
      state.saved[state.active].courses = addToSet(
        state.saved[state.active].courses,
        action.payload
      );
    },
    removeCourseFromActiveSchedule: (state, action: PayloadAction<string>) => {
      state.saved[state.active].courses = removeFromSet(
        state.saved[state.active].courses,
        action.payload
      );
    },
    setActiveScheduleCourses: (state, action: PayloadAction<string[]>) => {
      if (state.active === null) return;
      state.saved[state.active].courses = action.payload;
    },
    createEmptySchedule: (state) => {
      const newId = uuidv4();
      state.saved[newId] = {
        name: "My Schedule",
        courses: [],
        id: newId,
      };
      state.active = newId;
    },
    createSharedSchedule: (state, action: PayloadAction<string[]>) => {
      const newId = uuidv4();
      state.saved[newId] = {
        name: "Shared Schedule",
        courses: action.payload,
        id: newId,
      };
    },
    deleteSchedule: (state, action: PayloadAction<string>) => {
      delete state.saved[action.payload];
      if (state.active === action.payload) {
        // TODO: make this more intuitive - pick nearest ID?
        const scheduleIDs = Object.keys(state.saved);
        if (scheduleIDs.length === 0) {
          state.active = null;
        } else {
          state.active = scheduleIDs[0];
        }
      }
    },
    updateActiveScheduleName: (state, action: PayloadAction<string>) => {
      if (state.active !== null) {
        state.saved[state.active].name = action.payload;
      }
    },
  },
  extraReducers: (builder) => {},
});

export const selectCoursesInActiveSchedule = (state: RootState): string[] => {
  if (state.schedules.active === null) return [];
  return state.schedules.saved[state.schedules.active].courses;
};

export const reducer = userSchedulesSlice.reducer;
