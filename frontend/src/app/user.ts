import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { addToSet, removeFromSet } from "./utils";
import { SEMESTERS_COUNTED } from "./constants";
import { Semester } from "./types";

export interface UserState {
  bookmarked: string[];
  showFCEs: boolean;
  showCourseInfos: boolean;
  showSchedules: boolean;
  loggedIn: boolean;
  fceAggregation: {
    numSemesters: number;
    counted: {
      spring: boolean;
      summer: boolean;
      fall: boolean;
    };
    filters: {
      type: string;
      courses: string[];
      instructors: string[];
    }
  };
  token: string;
}

const initialState: UserState = {
  bookmarked: [],
  showFCEs: false,
  showCourseInfos: true,
  showSchedules: false,
  loggedIn: false,
  fceAggregation: {
    numSemesters: 2,
    counted: {
      spring: true,
      summer: false,
      fall: true,
    },
    filters: {
      type: "",
      courses: [],
      instructors: [],
    },
  },
  token: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addBookmark: (state, action: PayloadAction<string>) => {
      state.bookmarked = addToSet(state.bookmarked, action.payload);
    },
    removeBookmark: (state, action: PayloadAction<string>) => {
      state.bookmarked = removeFromSet(state.bookmarked, action.payload);
    },
    clearBookmarks: (state) => {
      state.bookmarked = [];
    },
    showFCEs: (state, action: PayloadAction<boolean>) => {
      state.showFCEs = action.payload;
    },
    showCourseInfos: (state, action: PayloadAction<boolean>) => {
      state.showCourseInfos = action.payload;
    },
    showSchedules: (state, action: PayloadAction<boolean>) => {
      state.showSchedules = action.payload;
    },
    logIn: (state) => {
      state.loggedIn = true;
    },
    logOut: (state) => {
      state.token = null;
      state.loggedIn = false;
    },
    updateSemestersCounted: (
      state,
      action: PayloadAction<{ semester: Semester; value: boolean }>
    ) => {
      if (!SEMESTERS_COUNTED.includes(action.payload.semester)) return;
      state.fceAggregation.counted[action.payload.semester] =
        action.payload.value;
    },
    updateNumSemesters: (state, action: PayloadAction<number>) => {
      const newNumSemesters = Math.min(Math.max(action.payload, 1), 20);
      if (isNaN(newNumSemesters)) return;
      state.fceAggregation.numSemesters = newNumSemesters;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setFilters: (state, action: PayloadAction<UserState["fceAggregation"]["filters"]>) => {
      state.fceAggregation.filters = action.payload;
    },
    resetFilters: (state) => {
      state.fceAggregation.filters = {
        type: "",
        courses: [],
        instructors: [],
      };
    }
  },
});

export const reducer = userSlice.reducer;
