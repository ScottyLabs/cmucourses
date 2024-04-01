import { createSlice } from "@reduxjs/toolkit";

export interface UIState {
  darkMode: boolean;
  sidebarOpen: boolean;
  session: {
    loginModalShown: boolean;
    loginModalOpen: boolean;
  };
  schedulesTopbarOpen: boolean;
}

const initialState: UIState = {
  darkMode: false,
  sidebarOpen: true,
  session: {
    loginModalShown: false,
    loginModalOpen: false,
  },
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
    openLoginModal: (state) => {
      state.session.loginModalOpen = true;
    },
    closeLoginModal: (state) => {
      state.session.loginModalShown = true;
      state.session.loginModalOpen = false;
    },
    toggleSchedulesTopbarOpen: (state) => {
      state.schedulesTopbarOpen = !state.schedulesTopbarOpen;
    },
  },
});

export const reducer = uiSlice.reducer;
