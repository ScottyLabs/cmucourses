import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Session } from "./types";
import { standardizeIdsInString } from "./utils";

export interface FiltersState {
  search: string;
  departments: {
    active: boolean;
    names: string[];
    query: string;
  };
  units: {
    active: boolean;
    min: number;
    max: number;
  };
  semesters: {
    active: boolean;
    sessions: Session[];
  };
  levels: {
    active: boolean;
    selected: boolean[]; // selected[i] <=> show i00 level
  };
  page: number,
  exactResultsCourses: string[];
}

const initialState: FiltersState = {
  search: "",
  departments: {
    active: false,
    names: [],
    query: "",
  },
  units: {
    active: false,
    min: 0,
    max: 24,
  },
  semesters: {
    active: false,
    sessions: [],
  },
  levels: {
    active: false,
    selected: [
      false, // 000
      false, // 100
      false, // 200
      false, // 300
      false, // 400
      false, // 500
      false, // 600
      false, // 700
      false, // 800
      false, // 900
    ],
  },
  page: 1,
  exactResultsCourses: [],
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
    updateDepartmentsQuery: (state, action: PayloadAction<string>) => {
      state.departments.query = action.payload;
    },
    updateSemestersActive: (state, action: PayloadAction<boolean>) => {
      state.semesters.active = action.payload;
    },
    deleteSemester: (state, action: PayloadAction<Session>) => {
      state.semesters.sessions = state.semesters.sessions.filter(
        (session) =>
          !(
            session.year === action.payload.year &&
            session.semester === action.payload.semester
          )
      );
    },
    updateSemesters: (state, action: PayloadAction<Session[]>) => {
      state.semesters.sessions = action.payload;
    },
    updateUnitsActive: (state, action: PayloadAction<boolean>) => {
      state.units.active = action.payload;
    },
    updateUnitsRange: (state, action: PayloadAction<[number, number]>) => {
      state.units.min = action.payload[0];
      state.units.max = action.payload[1];
    },
    updateLevelsActive: (state, action: PayloadAction<boolean>) => {
      state.levels.active = action.payload;
    },
    updateLevelsSelection: (state, action: PayloadAction<boolean[]>) => {
      state.levels.selected = action.payload;
    },
    deleteLevel: (state, action: PayloadAction<number[]>) => {
      for (const index of action.payload) {
        state.levels.selected[index] = false;
      }
    },
    resetFilters: (state) => {
      state.departments = initialState.departments;
      state.levels = initialState.levels;
      state.units = initialState.units;
      state.semesters = initialState.semesters;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setExactResultsCourses: (state, action: PayloadAction<string[]>) => {
      state.exactResultsCourses = action.payload;
    },
  },
});

export const reducer = filtersSlice.reducer;
