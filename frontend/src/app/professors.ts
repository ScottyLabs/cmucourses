import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ProfessorsState {
  search: string;
  typing: boolean;
}

const initialState: ProfessorsState = {
  search: "",
  typing: false,
};

export const professorsSlice = createSlice({
  name: "professors",
  initialState,
  reducers: {
    updateSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    updateTyping: (state, action: PayloadAction<boolean>) => {
      state.typing = action.payload;
    },
  },
});

export const reducer = professorsSlice.reducer;
