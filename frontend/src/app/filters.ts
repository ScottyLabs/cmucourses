import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { standardizeIdsInString } from "./utils";

export interface FiltersState {
  search: string;
  departments: {
    active: boolean;
    names: string[];
  };
  units: {
    active: boolean;
    min: number;
    max: number;
  };
}

const initialState: FiltersState = {
  search: "",
  departments: {
    active: false,
    names: [],
  },
  units: {
    active: false,
    min: 0,
    max: 24,
  },
};

export const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    updateSearch: (state, action: PayloadAction<string>) => {
      state.search = standardizeIdsInString(action.payload);
    },
    updateDepartmentsActive: (state, action: PayloadAction<boolean>) => {
      state.departments.active = action.payload;
    },
    deleteDepartment: (state, action: PayloadAction<string>) => {
      state.departments.names = state.departments.names.filter(
        (name) => name !== action.payload
      );
    },
    updateDepartments: (state, action: PayloadAction<string[]>) => {
      state.departments.names = action.payload;
    },
    updateUnitsActive: (state, action: PayloadAction<boolean>) => {
      state.units.active = action.payload;
    },
    updateUnitsRange: (state, action: PayloadAction<[number, number]>) => {
      state.units.min = action.payload[0];
      state.units.max = action.payload[1];
    },
  },
});

export const reducer = filtersSlice.reducer;
