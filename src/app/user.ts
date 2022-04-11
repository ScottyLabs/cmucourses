import { createSlice } from "@reduxjs/toolkit";
import { standardizeIdsInString } from "./utils";
import { SEMESTERS_COUNTED } from "./constants";

const initialState = {
  bookmarked: [],
  selected: [],
  showFCEs: false,
  showCourseInfos: true,
  loggedIn: false,
  filter: {
    search: "",
    departments: [],
  },
  fceAggregation: {
    numSemesters: 2,
    counted: {
      spring: true,
      summer: false,
      fall: true,
    },
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
        state.selected.push(action.payload);
      }
    },
    removeBookmark: (state, action) => {
      const index = state.bookmarked.indexOf(action.payload);
      if (index > -1) {
        state.bookmarked.splice(index, 1);
      }

      const selectedIndex = state.selected.indexOf(action.payload);
      if (index > -1) {
        state.selected.splice(selectedIndex, 1);
      }
    },
    addSelected: (state, action) => {
      if (state.bookmarked.indexOf(action.payload) == -1) return;
      if (state.selected.indexOf(action.payload) == -1) {
        state.selected.push(action.payload);
      }
    },
    removeSelected: (state, action) => {
      const selectedIndex = state.selected.indexOf(action.payload);
      if (selectedIndex > -1) {
        state.selected.splice(selectedIndex, 1);
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
      state.token = null;
      state.loggedIn = false;
    },
    updateSearch: (state, action) => {
      state.filter.search = standardizeIdsInString(action.payload);
    },
    updateDepartments: (state, action) => {
      state.filter.departments = action.payload;
    },
    updateSemestersCounted: (state, action) => {
      if (!SEMESTERS_COUNTED.includes(action.payload.semester)) return;
      state.fceAggregation.counted[action.payload.semester] = action.payload.value;
    },
    updateNumSemesters: (state, action) => {
      const newNumSemesters = Math.min(Math.max(parseInt(action.payload), 1), 10);
      if (isNaN(newNumSemesters)) return;
      state.fceAggregation.numSemesters = newNumSemesters;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
  },
});

export const reducer = userSlice.reducer;
