import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Session } from "./types";
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
  semesters: {
    active: boolean;
    sessions: Session[];
  };
  levels: {
    active: boolean;
    bitfield: number;
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
  semesters: {
    active: false,
    sessions: [],
  },
  levels: {
    active: false,
    bitfield: 0,
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
    updateLevelsBitfield: (state, action: PayloadAction<number>) => {
      state.levels.bitfield = action.payload;
    },
    deleteLevel: (state, action: PayloadAction<number>) => {
      state.levels.bitfield &= ~action.payload;
    },
  },
});

export const reducer = filtersSlice.reducer;
