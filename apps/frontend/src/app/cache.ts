import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Course } from "./types";
import {
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
  coursesLoading: boolean;
  exactResultsCourses: string[];
}

const initialState: CacheState = {
  totalDocs: 0,
  totalPages: 0,
  page: 1,
  pageCourses: [],
  coursesLoading: false,
  exactResultsCourses: [],
};

export const cacheSlice = createSlice({
  name: "cache",
  initialState,
  reducers: {
    setExactResultsCourses: (state, action: PayloadAction<string[]>) => {
      state.exactResultsCourses = action.payload;
    },
    setCoursesLoading: (state, action: PayloadAction<boolean>) => {
      state.coursesLoading = action.payload;
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
          }

          state.coursesLoading = false;
        },
      );
  },
});

export const reducer = cacheSlice.reducer;
