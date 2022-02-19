import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  bookmarked: [],
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
  },
  extraReducers: (builder) => {},
});

export const reducer = userSlice.reducer;
