import { createAsyncThunk } from "@reduxjs/toolkit";
import { Course, Session } from "../types";
import { RootState } from "../store";

export const fetchCourseInfos = createAsyncThunk<
  Course[],
  string[],
  { state: RootState }
>("fetchCourseInfos", async (ids: string[], thunkAPI) => {
  const state = thunkAPI.getState();

  const newIds = ids.filter((id) => !(id in state.cache.courseResults));
  if (newIds.length === 0) return [];

  const url = `${process.env.backendUrl || ""}/courses?`;
  const params = new URLSearchParams(ids.map((id) => ["courseID", id]));

  params.set("schedules", "true");

  if (state.user.loggedIn) {
    params.set("fces", "true");

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
    return (await fetch(url + params.toString())).json();
  }
});

export type FetchCourseInfosByPageResult = {
  docs: Course[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
};

export const fetchCourseInfosByPage = createAsyncThunk<
  FetchCourseInfosByPageResult,
  number,
  { state: RootState }
>("fetchCourseInfosByPage", async (page: number, thunkAPI) => {
  const state = thunkAPI.getState();

  const url = `${process.env.backendUrl || ""}/courses/search?`;
  const params = new URLSearchParams({
    page: `${page}`,
    schedules: "true",
  });

  if (state.filters.search !== "") {
    params.set("keywords", state.filters.search);
  }

  if (
    state.filters.departments.active &&
    state.filters.departments.names.length > 0
  ) {
    state.filters.departments.names.forEach((d) =>
      params.append("department", d)
    );
  }

  if (state.filters.units.active) {
    params.append("unitsMin", state.filters.units.min.toString());
    params.append("unitsMax", state.filters.units.max.toString());
  }

  if (state.filters.semesters.active) {
    state.filters.semesters.sessions.forEach((s: Session) =>
      params.append("session", JSON.stringify(s))
    );
  }

  if (state.filters.levels.active) {
    let value = "";
    state.filters.levels.selected.forEach((elem, index) => {
      if (elem) value += index.toString();
    });

    if (value) params.append("levels", value);
  }

  if (state.user.loggedIn) {
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
    return (await fetch(url + params.toString())).json();
  }
});

type FetchCourseInfoOptions = {
  courseID: string;
  schedules: boolean;
};

export const fetchCourseInfo = createAsyncThunk<
  Course,
  FetchCourseInfoOptions,
  { state: RootState }
>(
  "fetchCourseInfo",
  async ({ courseID, schedules }: FetchCourseInfoOptions, thunkAPI) => {
    if (!courseID) return;

    const state = thunkAPI.getState();
    if (courseID in state.cache.courseResults && !schedules) return;

    const url = `${process.env.backendUrl || ""}/course/${courseID}?`;
    const params = new URLSearchParams({
      schedules: schedules ? "true" : "false",
    });

    return (await fetch(url + params.toString())).json();
  }
);

type FetchAllCoursesType = { name: string; courseID: string }[];

export const fetchAllCourses = createAsyncThunk<
  FetchAllCoursesType,
  void,
  { state: RootState }
>("fetchAllCourses", async (_, thunkAPI) => {
  const url = `${process.env.backendUrl || ""}/courses/all`;
  const state = thunkAPI.getState();

  if (state.cache.allCourses.length > 0) return;

  return (
    await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();
});
