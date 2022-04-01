import { createSlice } from "@reduxjs/toolkit";
import { standardizeIdsInString } from "./utils";

const initialState = {
  bookmarked: [],
  showFCEs: false,
  showCourseInfos: true,
  loggedIn: false,
  filter: {
    search: "",
    departments: [],
  },
  token: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addBookmark: (state, action) => {
      if (state.bookmarked.indexOf(action.payload) == -1) {
        state.bookmarked.push(action.payload);
      }
    },
    removeBookmark: (state, action) => {
      const index = state.bookmarked.indexOf(action.payload);
      if (index > -1) {
          state.bookmarked.splice(index, 1);
      }
    },
    showFCEs: (state, action) => {
      state.showFCEs = action.payload;
    },
    showCourseInfos: (state, action) => {
      state.showCourseInfos = action.payload;
    },
    logIn: (state) => {
      state.loggedIn = true;
    },
    logOut: (state) => {
      state.loggedIn = false;
    },
    updateSearch: (state, action) => {
      state.filter.search = standardizeIdsInString(action.payload);
    },
    updateDepartments: (state, action) => {
      state.filter.departments = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    }
  },
  extraReducers: (builder) => {},
});

export const reducer = userSlice.reducer;
