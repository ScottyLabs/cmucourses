import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { addToSet, removeFromSet, standardizeIdsInString } from "./utils";
import { SEMESTERS_COUNTED } from "./constants";
import { Semester } from "./types";

export interface UserState {
  bookmarked: string[];
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
    addBookmark: (state, action: PayloadAction<string>) => {
      state.bookmarked = addToSet(state.bookmarked, action.payload);
    },
    removeBookmark: (state, action: PayloadAction<string>) => {
      state.bookmarked = removeFromSet(state.bookmarked, action.payload);
    },
    clearBookmarks: (state) => {
      state.bookmarked = [];
    },
    setExactMatchesOnly: (state, action: PayloadAction<boolean>) => {
      state.filter.exactMatchesOnly = action.payload;
    },
    showFCEs: (state, action: PayloadAction<boolean>) => {
      state.showFCEs = action.payload;
    },
    showCourseInfos: (state, action: PayloadAction<boolean>) => {
      state.showCourseInfos = action.payload;
    },
    logIn: (state) => {
      state.loggedIn = true;
    },
    logOut: (state) => {
      state.token = null;
      state.loggedIn = false;
    },
    updateSearch: (state, action: PayloadAction<string>) => {
      state.filter.search = standardizeIdsInString(action.payload);
    },
    updateDepartments: (state, action: PayloadAction<string[]>) => {
      state.filter.departments = action.payload;
    },
    updateSemestersCounted: (
      state,
      action: PayloadAction<{ semester: Semester; value: boolean }>
    ) => {
      if (!SEMESTERS_COUNTED.includes(action.payload.semester)) return;
      state.fceAggregation.counted[action.payload.semester] =
        action.payload.value;
    },
    updateNumSemesters: (state, action: PayloadAction<string>) => {
      const newNumSemesters = Math.min(
        Math.max(parseInt(action.payload), 1),
        10
      );
      if (isNaN(newNumSemesters)) return;
      state.fceAggregation.numSemesters = newNumSemesters;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
});

export const reducer = userSlice.reducer;
