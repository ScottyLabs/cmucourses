import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { set } from "lodash-es";

export interface FinalsState {
    search: string;
    numResults: number;
    ownCourses: string[];
    showOwn: boolean;
}

const initialState: FinalsState = {
    search: "",
    numResults: 0,
    ownCourses: [],
    showOwn: true,
};

export const finalsSlice = createSlice({
    name: "finals",
    initialState,
    reducers: {
        updateSearch: (state, action: PayloadAction<string>) => {
            state.search = action.payload;
        },
        setNumResults: (state, action: PayloadAction<number>) => {
            state.numResults = action.payload;
        },
        setOwnCourses: (state, action: PayloadAction<string[]>) => {
            state.ownCourses = action.payload;
        },
        setShowOwn: (state, action: PayloadAction<boolean>) => {
            state.showOwn = action.payload;
        },
    },
});

export const reducer = finalsSlice.reducer;
