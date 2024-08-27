import { createAsyncThunk } from "@reduxjs/toolkit";
import { FCE } from "~/types";
import { RootState } from "~/store";

type FCEInfosOptions = { courseIDs: string[] };

export const fetchFCEInfosByCourse = createAsyncThunk<
  FCE[],
  FCEInfosOptions,
  { state: RootState }
>("fetchFCEInfosByCourse", async ({ courseIDs }: FCEInfosOptions, thunkAPI) => {
  const state = thunkAPI.getState();

  const newIds = courseIDs.filter((id) => !(id in state.cache.fces));
  if (newIds.length === 0) return;

  const url = `${process.env.backendUrl || ""}/fces?`;
  const params = new URLSearchParams();

  newIds.forEach((courseID) => params.append("courseID", courseID));

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
  }
});

export const fetchFCEInfosByInstructor = createAsyncThunk<
  FCE[],
  string,
  { state: RootState }
>("fetchFCEInfosByInstructor", async (instructor: string, thunkAPI) => {
  const state = thunkAPI.getState();

  if (instructor in state.cache.instructorResults) return;

  const url = `${process.env.backendUrl || ""}/fces?`;
  const params = new URLSearchParams();
  params.append("instructor", instructor);

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
  }
});
