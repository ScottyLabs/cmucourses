import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { Course, FCE } from "./types";
import {
  fetchCourseInfos,
  fetchCourseInfosByPage,
  FetchCourseInfosByPageResult,
} from "./api/course";
import { fetchFCEInfosByCourse } from "./api/fce";

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
  fces: { [courseID: string]: FCE[] };
  fcesLoading: boolean;
  coursesLoading: boolean;
  exactResultsCourses: string[];
}

const initialState: CacheState = {
  totalDocs: 0,
  totalPages: 0,
  page: 1,
  pageCourses: [],
  courseResults: {},
  fces: {},
  fcesLoading: false,
  coursesLoading: false,
  exactResultsCourses: [],
};

export const selectCourseResults =
  (courseIDs: string[]) => (state: RootState) =>
    courseIDs
      .filter((courseID) => courseID in state.cache.courseResults)
      .map((courseID) => state.cache.courseResults[courseID]);

export const selectCourseResult = (courseID: string) => (state: RootState) =>
  state.cache.courseResults[courseID];

export const selectFCEResultsForCourses =
  (courseIDs: string[]) => (state: RootState) =>
    courseIDs.map((courseID) => {
      if (!state.cache.fces[courseID]) return { courseID, fces: [] };
      return { courseID, fces: state.cache.fces[courseID] };
    });

export const selectFCEResultsForCourse =
  (courseID: string) =>
    (state: RootState): FCE[] | undefined =>
      state.cache.fces[courseID];

export const cacheSlice = createSlice({
  name: "cache",
  initialState,
  reducers: {
    clearData: (state) => {
      state.fces = {};
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

    builder
      .addCase(fetchFCEInfosByCourse.pending, (state) => {
        state.fcesLoading = true;
      })
      .addCase(
        fetchFCEInfosByCourse.fulfilled,
        (state, action: PayloadAction<FCE[]>) => {
          state.fcesLoading = false;
          if (!action.payload) return;
          if (!action.payload[0]) return;

          const courseIDs = new Set<string>();
          for (const fce of action.payload) {
            courseIDs.add(fce.courseID);
          }

          courseIDs.forEach((courseID: string) => {
            state.fces[courseID] = [];
          });

          for (const fce of action.payload) {
            state.fces[fce.courseID].push(fce);
          }
        },
      );
  },
});

export const reducer = cacheSlice.reducer;
