import { createSlice, PayloadAction } from "@reduxjs/toolkit";

enum SortType {
  Ascending,
  Descending,
}

enum SortOption {
  FCE,
  TeachingRate,
  CourseRate,
  Units,
  CourseNumber,
}

export interface Sort {
  type: SortType;
  option: SortOption;
}

export interface SortState {
  sorts: Sort[];
}

const initialState: SortState = {
  sorts: [],
};

export const sortSlice = createSlice({
  name: "sort",
  initialState,
  reducers: {
    addSort(state, action: PayloadAction<Sort>) {
      state.sorts.push(action.payload);
    },
    removeSort(state, action: PayloadAction<Sort>) {
      state.sorts = state.sorts.filter((sort) => sort !== action.payload);
    },
    clearSorts(state) {
      state.sorts = [];
    },
    updateSorts(state, action: PayloadAction<Sort[]>) {
      state.sorts = action.payload;
    },
    updateSortType(
      state,
      action: PayloadAction<{ sort: Sort; type: SortType }>
    ) {
      const { sort, type } = action.payload;
      const index = state.sorts.indexOf(sort);
      const selected = state.sorts[index];

      if (selected) {
        selected.type = type;
      }
    },
  },
});

export const reducer = sortSlice.reducer;
