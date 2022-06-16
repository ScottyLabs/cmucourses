import { createSlice } from "@reduxjs/toolkit";
import { addToSet, removeFromSet, standardizeIdsInString } from "./utils";
import { SEMESTERS_COUNTED } from "./constants";

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
    active: number;
    saved: { name: string; courses: string[] }[];
    current: string[];
    selected: string[];
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
    saved: [],
    current: [],
    selected: [],
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
    toggleSelect: (state) => {
      if (state.schedules.selected.length > 0) {
        state.schedules.selected = [];
      } else {
        state.schedules.selected = [...state.schedules.current];
      }
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
    updateScheduleSelected: (state, action) => {
      state.schedules.selected = [...action.payload];
    },
    addScheduleSelected: (state, action) => {
      state.schedules.selected = addToSet(
        state.schedules.selected,
        action.payload
      );
    },
    removeScheduleSelected: (state, action) => {
      state.schedules.selected = removeFromSet(
        state.schedules.selected,
        action.payload
      );
    },
    updateCurrentSchedule: (state, action) => {
      state.schedules.current = [...action.payload];
      if (state.schedules.active !== null) {
        state.schedules.saved[state.schedules.active].courses = [
          ...action.payload,
        ];
      }
    },
    addToCurrentSchedule: (state, action) => {
      if (!state.schedules.current.includes(action.payload)) {
        state.schedules.current.push(action.payload);
        state.schedules.selected.push(action.payload);
      }
    },
    removeFromCurrentSchedule: (state, action) => {
      state.schedules.current = removeFromSet(
        state.schedules.current,
        action.payload
      );
      state.schedules.selected = removeFromSet(
        state.schedules.selected,
        action.payload
      );
    },
    saveSchedule: (state) => {
      if (state.schedules.active === null) {
        state.schedules.saved.push({
          name: "My Schedule",
          courses: [...state.schedules.current],
        });
      } else {
        state.schedules.saved[state.schedules.active].courses = [
          ...state.schedules.current,
        ];
      }
    },
    createEmptySchedule: (state) => {
      state.schedules.saved.push({
        name: "My Schedule",
        courses: [],
      });
      state.schedules.active = state.schedules.saved.length - 1;
      state.schedules.current =
        state.schedules.saved[state.schedules.active].courses;
      state.schedules.selected =
        state.schedules.saved[state.schedules.active].courses;
    },
    createSharedSchedule: (state, action) => {
      state.schedules.saved.push({
        name: "Shared Schedule",
        courses: action.payload.courses,
      });
      state.schedules.active = state.schedules.saved.length - 1;
      state.schedules.current =
        state.schedules.saved[state.schedules.active].courses;
      state.schedules.selected =
        state.schedules.saved[state.schedules.active].courses;
    },
    createSchedule: (state) => {
      if (state.schedules.active === null) {
        state.schedules.saved.push({
          name: "My Schedule",
          courses: [...state.schedules.current],
        });
      } else {
        state.schedules.saved.push({
          name: "My Schedule",
          courses: [],
        });
      }
      state.schedules.active = state.schedules.saved.length - 1;
      state.schedules.current =
        state.schedules.saved[state.schedules.active].courses;
      state.schedules.selected =
        state.schedules.saved[state.schedules.active].courses;
    },
    selectSchedule: (state, action) => {
      if (action.payload < 0) return;
      state.schedules.active = action.payload;
      state.schedules.current =
        state.schedules.saved[state.schedules.active].courses;
      state.schedules.selected = [...state.schedules.current];
    },
    deleteSchedule: (state, action) => {
      state.schedules.saved.splice(action.payload, 1);
      if (state.schedules.saved.length === 0) {
        state.schedules.active = null;
        state.schedules.current = [];
        state.schedules.selected = [];
      } else {
        if (state.schedules.active >= state.schedules.saved.length) {
          state.schedules.active -= 1;
        } else if (state.schedules.active < 0) {
          state.schedules.active = 0;
        }
        state.schedules.current =
          state.schedules.saved[state.schedules.active].courses;
        state.schedules.selected =
          state.schedules.saved[state.schedules.active].courses;
      }
    },
    updateActiveScheduleName: (state, action) => {
      if (state.schedules.active !== null) {
        state.schedules.saved[state.schedules.active].name = action.payload;
      }
    },
  },
  extraReducers: (builder) => {},
});

export const reducer = userSlice.reducer;
