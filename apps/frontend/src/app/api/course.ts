import { createAsyncThunk } from "@reduxjs/toolkit";
import { Course, Session } from "~/types";
import { RootState } from "~/store";
import axios from "axios";
import { useQuery, useQueries } from "@tanstack/react-query";
import { STALE_TIME } from "~/app/constants";
import { create, windowScheduler, keyResolver } from "@yornaath/batshit"

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

  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/courses/search?`;
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

const fetchCourseInfosBatcher = create({
  fetcher: async (courseIDs: string[]): Promise<Course[]> => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/courses?`;
    const params = new URLSearchParams(courseIDs.map((id) => ["courseID", id]));

    params.set("schedules", "true");

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
      params,
    });

    return response.data;
  },
  resolver: keyResolver("courseID"),
  scheduler: windowScheduler(10),
});

export const useFetchCourseInfo = (courseID: string) => {
  return useQuery({
    queryKey: ['courseInfo', courseID],
    queryFn: () => fetchCourseInfosBatcher.fetch(courseID),
    staleTime: STALE_TIME,
  });
};

export const useFetchCourseInfos = (courseIDs: string[]) => {
  return useQueries({
    queries: courseIDs.map((courseID) => ({
      queryKey: ['courseInfo', courseID],
      queryFn: () => fetchCourseInfosBatcher.fetch(courseID),
      staleTime: STALE_TIME,
    })),
    combine: result => {
      return result.reduce((acc, { data }) => {
        if (data) acc.push(data);
        return acc;
      }, [] as Course[]);
    },
  });
};

type FetchAllCoursesType = { name: string; courseID: string }[];

const fetchAllCourses = async (): Promise<FetchAllCoursesType> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/courses/all`;

  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

export const useFetchAllCourses = () => {
  return useQuery({
    queryKey: ['allCourses'],
    queryFn: fetchAllCourses,
    staleTime: STALE_TIME,
  });
};
