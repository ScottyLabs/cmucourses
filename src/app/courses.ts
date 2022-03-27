import { StarRateTwoTone } from "@mui/icons-material";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  totalDocs: 0,
  totalPages: 0,
  page: 1,
  results: [],
  bookmarkedResults: [],
  fces: {},
  loading: false
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

    if (state.user.loggedIn) {
      url += `&fces=true`;
      return fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: state.user.token
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

    if (state.user.filter.search !== "") {
      url += `&keywords=${state.user.filter.search}`;
    }

    if (state.user.filter.departments.length > 0) {
      url += state.user.filter.departments
        .map((d) => `&department=${d}`)
        .join("");
    }

    if (state.user.loggedIn) {
      url += `&fces=true`;
      return fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: state.user.token
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

    if (state.user.loggedIn) {
      return fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: state.user.token
        }),
      }).then((response) => response.json());
    }
  }
);

export const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    clearData: (state) => {
      state.fces = {};
      state.results = [];
      state.bookmarkedResults = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
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
      }
    );
  },
});

export const reducer = coursesSlice.reducer;
