import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";

type FetchAllProfessorsType = { name: string }[];

export const fetchAllProfessors = createAsyncThunk<
  FetchAllProfessorsType,
  void,
  { state: RootState }
>("fetchAllProfessors", async (_, thunkAPI) => {
  const url = `${process.env.backendUrl}/professors`;
  const state = thunkAPI.getState();

  if (state.cache.allProfessors.length > 0) return;

  return (
    await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();
});
