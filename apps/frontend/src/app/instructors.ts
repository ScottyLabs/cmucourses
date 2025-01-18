import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface InstructorsState {
  search: string;
  instructorsLoading: boolean;
  instructorPage: number;
  numResults: number;
}

const initialState: InstructorsState = {
  search: "",
  instructorsLoading: false,
  instructorPage: 1,
  numResults: 0,
};

export const instructorsSlice = createSlice({
  name: "instructors",
  initialState,
  reducers: {
    updateSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setInstructorPage: (state, action: PayloadAction<number>) => {
      state.instructorPage = action.payload;
    },
    setInstructorsLoading: (state, action: PayloadAction<boolean>) => {
      state.instructorsLoading = action.payload;
    },
    setNumResults: (state, action: PayloadAction<number>) => {
      state.numResults = action.payload;
    },
  },
});

export const reducer = instructorsSlice.reducer;
