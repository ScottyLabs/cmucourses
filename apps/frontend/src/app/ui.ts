import { createSlice } from "@reduxjs/toolkit";

export interface UIState {
  darkMode: boolean;
  sidebarOpen: boolean;
  schedulesTopbarOpen: boolean;
}

const initialState: UIState = {
  darkMode: false,
  sidebarOpen: true,
  schedulesTopbarOpen: false,
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
  },
});

export const reducer = uiSlice.reducer;
