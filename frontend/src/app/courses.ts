import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { Course, FCE, Schedule } from "./types";

interface CoursesState {
  totalDocs: number;
  totalPages: number;
  page: number;
  pageCourses: string[];
  courseResults: { [courseID: string]: Course };
  scheduleResults: { [courseID: string]: Schedule[] };
  fces: { [courseID: string]: FCE[] };
  fcesLoading: boolean;
  coursesLoading: boolean;
  exactResultsCourses: string[];
  allCourses: { courseID: string; name: string }[];
}

const initialState: CoursesState = {
  totalDocs: 0,
  totalPages: 0,
  page: 1,
  pageCourses: [],
  courseResults: {},
  scheduleResults: {},
  fces: {},
  fcesLoading: false,
  coursesLoading: false,
  exactResultsCourses: [],
  allCourses: [],
};

export const fetchCourseInfos = createAsyncThunk<
  Course[],
  string[],
  { state: RootState }
>("fetchCourseInfos", async (ids: string[], thunkAPI) => {
  const state = thunkAPI.getState();

  const newIds = ids.filter((id) => !(id in state.courses.courseResults));
  if (newIds.length === 0) return [];

  const url = `${process.env.backendUrl}/courses?`;
  const params = new URLSearchParams(ids.map((id) => ["courseID", id]));

  params.set("schedulesAvailable", "true");

  if (state.user.loggedIn) {
    params.set("fces", "true");

    return (
      await fetch(url + params.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: state.user.token,
        }),
      })
    ).json();
  } else {
    return (await fetch(url + params.toString())).json();
  }
});

type FetchCourseInfosByPageResult = {
  docs: Course[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
};

export const fetchCourseInfosByPage = createAsyncThunk<
  FetchCourseInfosByPageResult,
  number,
  { state: RootState }
>("fetchCourseInfosByPage", async (page: number, thunkAPI) => {
  const state = thunkAPI.getState();

  const url = `${process.env.backendUrl}/courses/search?`;
  const params = new URLSearchParams({
    page: `${page}`,
    schedulesAvailable: "true",
  });

  if (state.user.filter.search !== "") {
    params.set("keywords", state.user.filter.search);
  }

  if (state.user.filter.departments.length > 0) {
    state.user.filter.departments.forEach((d) =>
      params.append("department", d)
    );
  }

  if (state.user.loggedIn) {
    return (
      await fetch(url + params.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: state.user.token,
        }),
      })
    ).json();
  } else {
    return (await fetch(url + params.toString())).json();
  }
});

type FetchCourseInfoOptions = {
  courseID: string;
  schedules: boolean;
};

export const fetchCourseInfo = createAsyncThunk<
  Course,
  FetchCourseInfoOptions,
  { state: RootState }
>(
  "fetchCourseInfo",
  async ({ courseID, schedules }: FetchCourseInfoOptions, thunkAPI) => {
    if (!courseID) return;

    const state = thunkAPI.getState();
    if (courseID in state.courses.courseResults && !schedules) return;

    const url = `${process.env.backendUrl}/course/${courseID}?`;
    const params = new URLSearchParams({
      schedules: schedules ? "true" : "false",
    });

    return (await fetch(url + params.toString())).json();
  }
);

type FetchAllCoursesType = { name: string; courseID: string }[];

export const fetchAllCourses = createAsyncThunk<
  FetchAllCoursesType,
  void,
  { state: RootState }
>("fetchAllCourses", async (_, thunkAPI) => {
  const url = `${process.env.backendUrl}/courses/all`;
  const state = thunkAPI.getState();

  if (state.courses.allCourses.length > 0) return;

  return (
    await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();
});

type FCEInfosOptions = { courseIDs: string[] };

export const fetchFCEInfos = createAsyncThunk<
  FCE[],
  FCEInfosOptions,
  { state: RootState }
>("fetchFCEInfos", async ({ courseIDs }: FCEInfosOptions, thunkAPI) => {
  const state = thunkAPI.getState();

  const newIds = courseIDs.filter((id) => !(id in state.courses.fces));
  if (newIds.length === 0) return;

  const url = `${process.env.backendUrl}/fces?`;
  const params = new URLSearchParams();

  newIds.forEach((courseID) => params.append("courseID", courseID));

  if (state.user.loggedIn && state.user.token) {
    return (
      await fetch(url + params.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: state.user.token,
        }),
      })
    ).json();
  }
});

export const selectCourseResults =
  (courseIDs: string[]) => (state: RootState) =>
    courseIDs
      .filter((courseID) => courseID in state.courses.courseResults)
      .map((courseID) => state.courses.courseResults[courseID]);

export const selectCourseResult = (courseID: string) => (state: RootState) =>
  state.courses.courseResults[courseID];

export const selectFCEResultsForCourses =
  (courseIDs: string[]) => (state: RootState) =>
    courseIDs.map((courseID) => {
      if (!state.courses.fces[courseID]) return { courseID, fces: null };
      return { courseID, fces: state.courses.fces[courseID] };
    });

export const selectFCEResultsForCourse =
  (courseID: string) =>
  (state: RootState): FCE[] | undefined =>
    state.courses.fces[courseID];

export const selectScheduleForCourse =
  (courseID: string) =>
  (state: RootState): Schedule[] | undefined =>
    state.courses.scheduleResults[courseID];

export const coursesSlice = createSlice({
  name: "courses",
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
      .addCase(fetchFCEInfos.pending, (state) => {
        state.fcesLoading = true;
      })
      .addCase(
        fetchFCEInfos.fulfilled,
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
  },
});

export const reducer = coursesSlice.reducer;
