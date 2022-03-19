import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { standardizeIdsInString } from "./utils";

const initialState = {
  totalDocs: 0,
  totalPages: 0,
  page: 1,
  filter: {
    search: "",
    departments: [],
  },
  results: [],
  bookmarkedResults: [],
  fces: {},
  loggedIn: false,
};

export const fetchCourseInfos = createAsyncThunk(
  "fetchCourseInfos",
  async (ids: String[], thunkAPI) => {
    console.log("fetching");
    const state: any = thunkAPI.getState();

    if (ids.length === 0) return [];

    let url = `${process.env.backendUrl}/courseTool/courses/?`;

    url += ids
        .map((d) => `courseID=${d}`)
        .join("&");

    url += "&schedulesAvailable=true";

    if (state.courses.loggedIn) {
      url += `&fces=true`;
      return fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: localStorage.getItem("course_token"),
        }),
      }).then((response) => response.json());
    } else {
      return fetch(url).then((response) => response.json());
    }
  }
)

export const fetchCourseInfosByPage = createAsyncThunk(
  "fetchCourseInfosByPage",
  async (page: number, thunkAPI) => {
    console.log("fetching");
    const state: any = thunkAPI.getState();

    let url = `${process.env.backendUrl}/courseTool/?page=${page}&schedulesAvailable=true`;

    if (state.courses.filter.search !== "") {
      url += `&keywords=${state.courses.filter.search}`;
    }

    if (state.courses.filter.departments.length > 0) {
      url += state.courses.filter.departments
        .map((d) => `&department=${d}`)
        .join("");
    }

    if (state.courses.loggedIn) {
      url += `&fces=true`;
      return fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: localStorage.getItem("course_token"),
        }),
      }).then((response) => response.json());
    } else {
      return fetch(url).then((response) => response.json());
    }
  }
);

export const fetchCourseInfo = async ({ courseID, schedules }: any) => {
  if (!courseID) return;
  let url = `${process.env.backendUrl}/courseTool/courseID/${courseID}?`;
  if (schedules) url += `schedules=${schedules}`;

  return fetch(url).then((response) => response.json());
};

export const fetchFCEInfos = createAsyncThunk(
  "fetchFCEInfos",
  async ({ courseIDs }: any, thunkAPI) => {
    const state: any = thunkAPI.getState();

    let url = `${process.env.backendUrl}/fces/?`;
    url += courseIDs.map((courseID) => `courseID=${courseID}`).join("&");

    if (state.courses.loggedIn) {
      return fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: localStorage.getItem("course_token"),
        }),
      }).then((response) => response.json());
    }
  }
);

export const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    updateSearch: (state, action) => {
      state.filter.search = standardizeIdsInString(action.payload);
    },
    updateDepartments: (state, action) => {
      state.filter.departments = action.payload;
    },
    logIn: (state) => {
      state.loggedIn = true;
    },
    logOut: (state) => {
      state.loggedIn = false;
    },
    clearData: (state) => {
      state.fces = {};
      state.results = [];
      state.bookmarkedResults = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchCourseInfosByPage.fulfilled,
      (state, action: PayloadAction<any>) => {
        console.log(action.payload);
        state.totalDocs = action.payload.totalDocs;
        state.totalPages = action.payload.totalPages;
        state.page = action.payload.page;
        state.results = action.payload.docs;
      }
    );

    builder.addCase(
      fetchCourseInfos.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.bookmarkedResults = action.payload;
      }
    );

    builder.addCase(
      fetchFCEInfos.fulfilled,
      (state, action: PayloadAction<any>) => {
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
      }
    );
  },
});

export const reducer = coursesSlice.reducer;
