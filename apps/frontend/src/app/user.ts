import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { addToSet, removeFromSet } from "./utils";
import { CAL_VIEW, SCHED_VIEW, SEMESTERS_COUNTED } from "./constants";
import { Semester } from "./types";

export interface UserState {
  bookmarked: string[];
  showFCEs: boolean;
  showCourseInfos: boolean;
  showSchedules: boolean;
  showAll: boolean;
  savedShowFCEs: boolean;
  savedShowCourseInfos: boolean;
  savedShowSchedules: boolean;
  savedShowAll: boolean;
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
    };
  };
  selectedSchool: string;
  selectedTags: string[];
  scheduleView: string;
}

const initialState: UserState = {
  bookmarked: [],
  showFCEs: false,
  showCourseInfos: true,
  showSchedules: false,
  showAll: false,
  savedShowFCEs: false,
  savedShowCourseInfos: false,
  savedShowSchedules: false,
  savedShowAll: false,
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
  selectedSchool: "SCS",
  selectedTags: [],
  scheduleView: "cal",
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
    showAll: (state, action: PayloadAction<boolean>) => {
      state.showAll = action.payload;
    },
    savedShowFCEs: (state, action: PayloadAction<boolean>) => {
      state.savedShowFCEs = action.payload;
    },
    savedShowCourseInfos: (state, action: PayloadAction<boolean>) => {
      state.savedShowCourseInfos = action.payload;
    },
    savedShowSchedules: (state, action: PayloadAction<boolean>) => {
      state.savedShowSchedules = action.payload;
    },
    savedShowAll: (state, action: PayloadAction<boolean>) => {
      state.savedShowAll = action.payload;
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
    setFilters: (
      state,
      action: PayloadAction<UserState["fceAggregation"]["filters"]>
    ) => {
      state.fceAggregation.filters = action.payload;
    },
    resetFilters: (state) => {
      state.fceAggregation.filters = {
        type: "",
        courses: [],
        instructors: [],
      };
    },
    setSelectedSchool: (state, action: PayloadAction<string>) => {
      state.selectedSchool = action.payload;
    },
    setSelectedTags: (state, action: PayloadAction<string[]>) => {
      state.selectedTags = action.payload;
    },
    toggleScheduleView: (state) => {
      state.scheduleView =
        state.scheduleView === CAL_VIEW ? SCHED_VIEW : CAL_VIEW;
    },
  },
});

export const reducer = userSlice.reducer;
