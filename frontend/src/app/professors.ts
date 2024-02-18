import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ProfessorsState {
  search: string;
}

const initialState: ProfessorsState = {
  search: "",
};

export const professorsSlice = createSlice({
  name: "professors",
  initialState,
  reducers: {
    updateSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
  },
});

export const reducer = professorsSlice.reducer;
