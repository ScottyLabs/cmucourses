import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum SortType {
  Ascending,
  Descending,
}

export enum SortOption {
  FCE = "FCE",
  TeachingRate = "Teaching Rate",
  CourseRate = "Course Rate",
  Units = "Units",
  CourseNumber = "Course Number",
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
    removeSortByOption(state, action: PayloadAction<SortOption>) {
      state.sorts = state.sorts.filter(
        (sort) => sort.option !== action.payload
      );
    },
    resetSorts(state) {
      state.sorts = initialState.sorts;
    },
    updateSortsByOption(state, action: PayloadAction<SortOption[]>) {
      state.sorts = action.payload.map((option) => {
        const sort = state.sorts.find((sort) => sort.option === option);
        return sort ? sort : { option, type: SortType.Descending };
      });
    },
    updateSorts(state, action: PayloadAction<Sort[]>) {
      state.sorts = [...action.payload];
    },
    toggleSortType(state, action: PayloadAction<Sort>) {
      state.sorts = state.sorts.map((sort) =>
        sort.option === action.payload.option
          ? {
              ...sort,
              type:
                sort.type === SortType.Ascending
                  ? SortType.Descending
                  : SortType.Ascending,
            }
          : sort
      );
    },
  },
});

export const reducer = sortSlice.reducer;
