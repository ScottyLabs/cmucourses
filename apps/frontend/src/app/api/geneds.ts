import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "~/store";
import { Gened } from "~/app/types";

export const fetchGenedsBySchool = createAsyncThunk<
  Gened[],
  string,
  { state: RootState }
>("fetchGenedsBySchool", async (school: string, thunkAPI) => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/geneds?`;
  const state = thunkAPI.getState();

  const params = new URLSearchParams();
  params.append("school", school);

  if (state.user.loggedIn && state.user.token) {
    return (
      await fetch(url + params.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: state.user.token,
        }),
      })
    ).json();
  } else {
    return (
      await fetch(url + params.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();
  }
});
