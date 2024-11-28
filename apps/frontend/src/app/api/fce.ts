import { createAsyncThunk } from "@reduxjs/toolkit";
import { FCE } from "~/types";
import { RootState } from "~/store";
import axios from "axios";
import { GetToken } from "@clerk/types";
import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "~/app/constants";

type FCEInfosOptions = { courseIDs: string[] };

export const fetchFCEInfosByCourse = createAsyncThunk<
  FCE[],
  FCEInfosOptions,
  { state: RootState }
>("fetchFCEInfosByCourse", async ({ courseIDs }: FCEInfosOptions, thunkAPI) => {
  const state = thunkAPI.getState();

  const newIds = courseIDs.filter((id) => !(id in state.cache.fces));
  if (newIds.length === 0) return;

  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/fces?`;
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

export const fetchFCEInfosByInstructor = async (instructor: string, isSignedIn: boolean | undefined, getToken: GetToken): Promise<FCE[]> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/fces`;
  const params = new URLSearchParams();
  params.append("instructor", instructor);

  const token = await getToken();

  if (isSignedIn && token) {
    const response = await axios.post(url, { token }, {
      headers: {
        "Content-Type": "application/json",
      },
      params,
    });
    return response.data;
  }
  return [];
};

export const useFetchFCEInfosByInstructor = (instructor: string, isSignedIn: boolean | undefined, getToken: GetToken) => {
  return useQuery({
    queryKey: ['instructorFCEs', instructor, isSignedIn],
    queryFn: () => fetchFCEInfosByInstructor(instructor, isSignedIn, getToken),
    staleTime: STALE_TIME,
  });
}
