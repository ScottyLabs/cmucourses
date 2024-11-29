import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Course } from "./types";
import {
  fetchCourseInfos,
  fetchCourseInfosByPage,
  FetchCourseInfosByPageResult,
} from "./api/course";

/**
 * This cache lasts for the duration of the user session
 * (i.e. when the user refreshes, it should reset).
 */

interface CacheState {
  totalDocs: number;
  totalPages: number;
  page: number;
  pageCourses: string[];
  courseResults: { [courseID: string]: Course };
  coursesLoading: boolean;
  exactResultsCourses: string[];
}

const initialState: CacheState = {
  totalDocs: 0,
  totalPages: 0,
  page: 1,
  pageCourses: [],
  courseResults: {},
  coursesLoading: false,
  exactResultsCourses: [],
};

export const cacheSlice = createSlice({
  name: "cache",
  initialState,
  reducers: {
    clearData: (state) => {
      state.courseResults = {};
    },
    setExactResultsCourses: (state, action: PayloadAction<string[]>) => {
      state.exactResultsCourses = action.payload;
    },
    setCoursesLoading: (state, action: PayloadAction<boolean>) => {
      state.coursesLoading = action.payload;
    },
    updateUnits: (state, action: PayloadAction<{units: string, courseID: string}>) => {
      const units = action.payload.units
      const courseID = action.payload.courseID
      state.courseResults[courseID].manualUnits = units
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourseInfosByPage.pending, (state) => {
        state.coursesLoading = true;
      })
      .addCase(
        fetchCourseInfosByPage.fulfilled,
        (state, action: PayloadAction<FetchCourseInfosByPageResult>) => {
          state.totalDocs = action.payload.totalDocs;
          state.totalPages = action.payload.totalPages;
          state.page = action.payload.page;
          state.pageCourses = [];

          for (const result of action.payload.docs) {
            state.pageCourses.push(result.courseID);
            state.courseResults[result.courseID] = result;
          }

          state.coursesLoading = false;
        },
      );

    builder
      .addCase(fetchCourseInfos.pending, (state) => {
        state.coursesLoading = true;
      })
      .addCase(
        fetchCourseInfos.fulfilled,
        (state, action: PayloadAction<Course[]>) => {
          for (const result of action.payload) {
            state.courseResults[result.courseID] = result;
          }
          state.coursesLoading = false;
        },
      );
  },
});

export const reducer = cacheSlice.reducer;
