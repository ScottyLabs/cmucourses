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
  },
  extraReducers: (builder) => {},
});

export const reducer = userSlice.reducer;
