import { createSlice } from "@reduxjs/toolkit";

export interface UIState {
  darkMode: boolean;
  sidebarOpen: boolean;
  schedulesTopbarOpen: boolean;
  // Guards against rendering multiple course search bars simultaneously.
  searchBarMounted: boolean;
}

const initialState: UIState = {
  darkMode: false,
  sidebarOpen: true,
  schedulesTopbarOpen: false,
  searchBarMounted: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    toggleSidebarOpen: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleSchedulesTopbarOpen: (state) => {
      state.schedulesTopbarOpen = !state.schedulesTopbarOpen;
    },
    setSearchBarMounted: (state, action) => {
      state.searchBarMounted = action.payload as boolean;
    },
  },
});

export const reducer = uiSlice.reducer;
