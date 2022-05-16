import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CoursesState {
  totalDocs: number;
  totalPages: number;
  page: number;
  pageCourses: string[];
  courseResults: { [courseID: string]: any };
  scheduleResults: { [courseID: string]: any };
  fces: { [courseID: string]: any };
  fcesLoading: boolean;
  coursesLoading: boolean;
  exactResultsCourses: string[];
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
};

export const fetchCourseInfos = createAsyncThunk(
  "fetchCourseInfos",
  async (ids: string[], thunkAPI) => {
    const state: any = thunkAPI.getState();

    const newIds = ids.filter((id) => !(id in state.courses.courseResults));
    if (newIds.length === 0) return [];

    const url = `/api/courses?`;
    const params = new URLSearchParams(newIds.map((id) => ["courseID", id]));

    params.set("schedulesAvailable", "true");

    if (state.user.loggedIn) {
      params.set("fces", "true");

      return fetch(url + params.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: state.user.token,
        }),
      }).then((response) => response.json());
    } else {
      return fetch(url + params.toString()).then((response) => response.json());
    }
  }
);

export const fetchCourseInfosByPage = createAsyncThunk(
  "fetchCourseInfosByPage",
  async (page: number, thunkAPI) => {
    const state: any = thunkAPI.getState();

    const url = `/api/courses/search/?`;
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
      return fetch(url + params.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: state.user.token,
        }),
      }).then((response) => response.json());
    } else {
      return fetch(url + params.toString()).then((response) => response.json());
    }
  }
);

export const fetchCourseInfo = createAsyncThunk(
  "fetchCourseInfo",
  async (
    {
      courseID,
      schedules,
    }: {
      courseID: string;
      schedules: boolean;
    },
    thunkAPI
  ) => {
    if (!courseID) return;

    const state: any = thunkAPI.getState();
    if (courseID in state.courses.courseResults && !schedules) return;

    const url = `/api/course/${courseID}?`;
    const params = new URLSearchParams({
      schedules: `${schedules}`,
    });

    return fetch(url + params.toString()).then((response) => response.json());
  }
);

export const fetchFCEInfos = createAsyncThunk(
  "fetchFCEInfos",
  async ({ courseIDs }: { courseIDs: string[] }, thunkAPI) => {
    const state: any = thunkAPI.getState();

    const newIds = courseIDs.filter((id) => !(id in state.courses.fces));
    if (newIds.length === 0) return;

    const url = `/api/fces?`;
    const params = new URLSearchParams();

    newIds.forEach((courseID) => params.append("courseID", courseID));

    if (state.user.loggedIn && state.user.token) {
      return fetch(url + params.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: state.user.token,
        }),
      }).then((response) => response.json());
    }
  }
);

export const selectCourseResults = (courseIDs: string[]) => (state) =>
  courseIDs
    .filter((courseID) => courseID in state.courses.courseResults)
    .map((courseID) => state.courses.courseResults[courseID]);

export const selectCourseResult = (courseID: string) => (state) =>
  state.courses.courseResults[courseID];

export const selectFCEResultsForCourses = (courseIDs: string[]) => (state) =>
  courseIDs.map((courseID) => {
    if (!state.courses.fces[courseID]) return { courseID, fces: null };
    return { courseID, fces: state.courses.fces[courseID] };
  });

export const selectFCEResultsForCourse = (courseID: string) => (state) =>
  state.courses.fces[courseID];

export const selectScheduleForCourse = (courseID: string) => (state) =>
  state.courses.scheduleResults[courseID];

export const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    clearData: (state) => {
      state.fces = {};
      state.courseResults = {};
    },
    setExactResultsCourses: (state, action) => {
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
        (state, action: PayloadAction<any>) => {
          console.log(action.payload);
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
        (state, action: PayloadAction<any>) => {
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
        (state, action: PayloadAction<any>) => {
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
      .addCase(fetchFCEInfos.fulfilled, (state, action: PayloadAction<any>) => {
        state.fcesLoading = false;
        if (!action.payload) return;
        if (!action.payload[0]) return;

        const courseIds = new Set<String>();
        for (const fce of action.payload) {
          courseIds.add(fce.courseID);
        }

        courseIds.forEach((courseId: any) => {
          state.fces[courseId] = [];
        });

        for (const fce of action.payload) {
          state.fces[fce.courseID].push(fce);
        }
      });
  },
});

export const reducer = coursesSlice.reducer;
