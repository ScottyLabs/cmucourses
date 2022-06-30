import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { addToSet, removeFromSet, standardizeIdsInString } from "./utils";
import { SEMESTERS_COUNTED } from "./constants";
import { Session } from "./types";
import { v4 as uuidv4 } from "uuid";
import { RootState } from "./store";

export interface UserSchedule {
  name: string;
  courses: string[];
  id: string;
  session?: Session;
}

export interface UserState {
  bookmarked: string[];
  darkMode: boolean;
  showFCEs: boolean;
  showCourseInfos: boolean;
  loggedIn: boolean;
  filter: {
    search: string;
    departments: string[];
    exactMatchesOnly: boolean;
  };
  fceAggregation: {
    numSemesters: number;
    counted: {
      spring: boolean;
      summer: boolean;
      fall: boolean;
    };
  };
  schedules: {
    active: string | null;
    saved: { [id: string]: UserSchedule };
  };
  token: string;
}

const initialState: UserState = {
  bookmarked: [],
  darkMode: false,
  showFCEs: false,
  showCourseInfos: true,
  loggedIn: false,
  filter: {
    search: "",
    departments: [],
    exactMatchesOnly: false,
  },
  fceAggregation: {
    numSemesters: 2,
    counted: {
      spring: true,
      summer: false,
      fall: true,
    },
  },
  schedules: {
    active: null,
    saved: {},
  },
  token: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addBookmark: (state, action) => {
      state.bookmarked = addToSet(state.bookmarked, action.payload);
    },
    removeBookmark: (state, action) => {
      state.bookmarked = removeFromSet(state.bookmarked, action.payload);
    },
    clearBookmarks: (state) => {
      state.bookmarked = [];
    },
    setExactMatchesOnly: (state, action) => {
      state.filter.exactMatchesOnly = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    showFCEs: (state, action) => {
      state.showFCEs = action.payload;
    },
    showCourseInfos: (state, action) => {
      state.showCourseInfos = action.payload;
    },
    logIn: (state) => {
      state.loggedIn = true;
    },
    logOut: (state) => {
      state.token = null;
      state.loggedIn = false;
    },
    updateSearch: (state, action) => {
      state.filter.search = standardizeIdsInString(action.payload);
    },
    updateDepartments: (state, action) => {
      state.filter.departments = action.payload;
    },
    updateSemestersCounted: (state, action) => {
      if (!SEMESTERS_COUNTED.includes(action.payload.semester)) return;
      state.fceAggregation.counted[action.payload.semester] =
        action.payload.value;
    },
    updateNumSemesters: (state, action) => {
      const newNumSemesters = Math.min(
        Math.max(parseInt(action.payload), 1),
        10
      );
      if (isNaN(newNumSemesters)) return;
      state.fceAggregation.numSemesters = newNumSemesters;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    changeActiveSchedule: (state, action: PayloadAction<string>) => {
      state.schedules.active = action.payload;
    },
    addCourseToActiveSchedule: (state, action: PayloadAction<string>) => {
      if (state.schedules.active === null) {
        const newId = uuidv4();
        state.schedules.saved[newId] = {
          name: "My Schedule",
          courses: [],
          id: newId,
        };
        state.schedules.active = newId;
      }
      state.schedules.saved[state.schedules.active].courses = addToSet(
        state.schedules.saved[state.schedules.active].courses,
        action.payload
      );
    },
    removeCourseFromActiveSchedule: (state, action: PayloadAction<string>) => {
      state.schedules.saved[state.schedules.active].courses = removeFromSet(
        state.schedules.saved[state.schedules.active].courses,
        action.payload
      );
    },
    setActiveScheduleCourses: (state, action: PayloadAction<string[]>) => {
      if (state.schedules.active === null) return;
      state.schedules.saved[state.schedules.active].courses = action.payload;
    },
    createEmptySchedule: (state) => {
      const newId = uuidv4();
      state.schedules.saved[newId] = {
        name: "My Schedule",
        courses: [],
        id: newId,
      };
      state.schedules.active = newId;
    },
    createSharedSchedule: (state, action: PayloadAction<string[]>) => {
      const newId = uuidv4();
      state.schedules.saved[newId] = {
        name: "Shared Schedule",
        courses: action.payload,
        id: newId,
      };
    },
    deleteSchedule: (state, action: PayloadAction<string>) => {
      delete state.schedules.saved[action.payload];
      if (state.schedules.active === action.payload) {
        // TODO: make this more intuitive - pick nearest ID?
        const scheduleIDs = Object.keys(state.schedules.saved);
        if (scheduleIDs.length === 0) {
          state.schedules.active = null;
        } else {
          state.schedules.active = scheduleIDs[0];
        }
      }
    },
    updateActiveScheduleName: (state, action: PayloadAction<string>) => {
      if (state.schedules.active !== null) {
        state.schedules.saved[state.schedules.active].name = action.payload;
      }
    },
  },
  extraReducers: (builder) => {},
});

export const selectCoursesInActiveSchedule = (state: RootState): string[] => {
  if (state.user.schedules.active === null) return [];
  return state.user.schedules.saved[state.user.schedules.active].courses;
};

export const reducer = userSlice.reducer;
