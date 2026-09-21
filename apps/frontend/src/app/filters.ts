import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Session } from "./types";
import type { Modality } from "@cmucourses/profile";
import { standardizeIdsInString } from "./utils";

/**
 * Time-of-day buckets, matched server-side against a section's start time. "tba" is the
 * roughly half of the catalog that has no stated meeting time; it is only ever included
 * when explicitly selected.
 */
export const CLASS_TIMES = ["morning", "afternoon", "evening", "tba"] as const;

export type ClassTime = (typeof CLASS_TIMES)[number];

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
  classTimes: {
    active: boolean;
    selected: ClassTime[];
  };
  meetingDays: {
    active: boolean;
    selected: number[];
  };
  timeRange: {
    active: boolean;
    begin: number;
    end: number;
  };
  modalities: {
    active: boolean;
    selected: Modality[];
  };
  fitAvailability: boolean;
  page: number;
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
  classTimes: {
    active: false,
    selected: [],
  },
  meetingDays: { active: false, selected: [] },
  timeRange: { active: false, begin: 8 * 60, end: 18 * 60 },
  modalities: { active: false, selected: [] },
  fitAvailability: false,
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
    updateClassTimesActive: (state, action: PayloadAction<boolean>) => {
      state.classTimes.active = action.payload;
    },
    updateClassTimes: (state, action: PayloadAction<ClassTime[]>) => {
      state.classTimes.selected = action.payload;
    },
    deleteClassTime: (state, action: PayloadAction<ClassTime>) => {
      state.classTimes.selected = state.classTimes.selected.filter(
        (classTime) => classTime !== action.payload
      );
    },
    updateMeetingDays: (state, action: PayloadAction<number[]>) => {
      state.meetingDays = { active: true, selected: action.payload };
    },
    updateMeetingDaysActive: (state, action: PayloadAction<boolean>) => {
      state.meetingDays.active = action.payload;
    },
    updateTimeRange: (state, action: PayloadAction<[number, number]>) => {
      state.timeRange = {
        active: true,
        begin: action.payload[0],
        end: action.payload[1],
      };
    },
    updateTimeRangeActive: (state, action: PayloadAction<boolean>) => {
      state.timeRange.active = action.payload;
    },
    updateModalities: (state, action: PayloadAction<Modality[]>) => {
      state.modalities = { active: true, selected: action.payload };
    },
    updateModalitiesActive: (state, action: PayloadAction<boolean>) => {
      state.modalities.active = action.payload;
    },
    updateFitAvailability: (state, action: PayloadAction<boolean>) => {
      state.fitAvailability = action.payload;
    },
    resetFilters: (state) => {
      state.departments = initialState.departments;
      state.levels = initialState.levels;
      state.units = initialState.units;
      state.semesters = initialState.semesters;
      state.classTimes = initialState.classTimes;
      state.meetingDays = initialState.meetingDays;
      state.timeRange = initialState.timeRange;
      state.modalities = initialState.modalities;
      state.fitAvailability = initialState.fitAvailability;
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
