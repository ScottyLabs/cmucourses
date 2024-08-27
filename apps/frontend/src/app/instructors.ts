import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface InstructorsState {
  search: string;
}

const initialState: InstructorsState = {
  search: "",
};

export const instructorsSlice = createSlice({
  name: "instructors",
  initialState,
  reducers: {
    updateSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
  },
});

export const reducer = instructorsSlice.reducer;
