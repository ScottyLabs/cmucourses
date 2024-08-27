import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "~/store";

type FetchAllInstructorsType = { instructor: string }[];

export const fetchAllInstructors = createAsyncThunk<
  FetchAllInstructorsType,
  void,
  { state: RootState }
>("fetchAllInstructors", async (_, thunkAPI) => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/instructors`;
  const state = thunkAPI.getState();

  if (state.cache.allInstructors.length > 0) return;

  return (
    await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();
});
