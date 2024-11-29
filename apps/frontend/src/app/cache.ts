import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * This cache lasts for the duration of the user session
 * (i.e. when the user refreshes, it should reset).
 */

interface CacheState {
  page: number;
  exactResultsCourses: string[];
}

const initialState: CacheState = {
  page: 1,
  exactResultsCourses: [],
};

export const cacheSlice = createSlice({
  name: "cache",
  initialState,
  reducers: {
    setExactResultsCourses: (state, action: PayloadAction<string[]>) => {
      state.exactResultsCourses = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
  },
});

export const reducer = cacheSlice.reducer;
