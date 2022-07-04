import { createSlice } from "@reduxjs/toolkit";

export interface UIState {
  darkMode: boolean;
  sidebarOpen: boolean;
}

const initialState: UIState = {
  darkMode: false,
  sidebarOpen: true,
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
  },
  extraReducers: (builder) => {},
});

export const reducer = uiSlice.reducer;
