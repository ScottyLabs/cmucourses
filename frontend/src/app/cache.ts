import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "./store";
import {Course, FCE, Schedule} from "./types";
import {
  fetchAllCourses,
  fetchCourseInfo,
  fetchCourseInfos,
  fetchCourseInfosByPage,
  FetchCourseInfosByPageResult,
} from "./api/course";
import {fetchFCEInfosByCourse, fetchFCEInfosByInstructor} from "./api/fce";

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
  scheduleResults: { [courseID: string]: Schedule[] };
  fces: { [courseID: string]: FCE[] };
  fcesLoading: boolean;
  instructorResults: { [instructor: string]: FCE[] };
  instructorLoading: boolean;
  coursesLoading: boolean;
  exactResultsCourses: string[];
  allCourses: { courseID: string; name: string }[];
}

const initialState: CacheState = {
  totalDocs: 0,
  totalPages: 0,
  page: 1,
  pageCourses: [],
  courseResults: {},
  scheduleResults: {},
  fces: {},
  fcesLoading: false,
  instructorResults: {},
  instructorLoading: false,
  coursesLoading: false,
  exactResultsCourses: [],
  allCourses: [],
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
      if (!state.cache.fces[courseID]) return { courseID, fces: null };
      return { courseID, fces: state.cache.fces[courseID] };
    });

export const selectFCEResultsForCourse =
  (courseID: string) =>
  (state: RootState): FCE[] | undefined =>
    state.cache.fces[courseID];

export const selectScheduleForCourse =
  (courseID: string) =>
  (state: RootState): Schedule[] | undefined =>
    state.cache.scheduleResults[courseID];

export const selectFCEResultsForInstructor =
  (name: string) =>
  (state: RootState): FCE[] | undefined =>
    state.cache.instructorResults[name];

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
        }
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
        }
      );

    builder
      .addCase(fetchCourseInfo.pending, (state) => {
        state.coursesLoading = true;
      })
      .addCase(
        fetchCourseInfo.fulfilled,
        (state, action: PayloadAction<Course>) => {
          state.courseResults[action.payload.courseID] = action.payload;
          state.coursesLoading = false;

          if (action.payload.schedules) {
            state.scheduleResults[action.payload.courseID] =
              action.payload.schedules;
          }
        }
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
        }
      );

    builder.addCase(fetchAllCourses.fulfilled, (state, action) => {
      if (action.payload) state.allCourses = action.payload;
    });

    builder
      .addCase(fetchFCEInfosByInstructor.pending, (state) => {
        state.instructorLoading = true;
      })
      .addCase(fetchFCEInfosByInstructor.fulfilled, (state, action) => {
        state.instructorLoading = false;
        if (!action.payload) return;
        if (!action.payload[0]) return;

        state.instructorResults[action.meta.arg] = action.payload;
      });
  },
});

export const reducer = cacheSlice.reducer;
