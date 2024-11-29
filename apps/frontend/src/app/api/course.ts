import axios from "axios";
import { useQuery, useQueries, keepPreviousData } from "@tanstack/react-query";
import { create, windowScheduler, keyResolver } from "@yornaath/batshit"
import { Course, Session } from "~/types";
import { STALE_TIME } from "~/app/constants";
import { FiltersState } from "~/app/filters";
import { useAppSelector } from "~/app/hooks";

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

const fetchCourseInfosByPage = async (filters: FiltersState, page: number): Promise<FetchCourseInfosByPageResult> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/courses/search?`;
  const params = new URLSearchParams({
    page: `${page}`,
    schedules: "true",
  });

  if (filters.search !== "") {
    params.set("keywords", filters.search);
  }

  if (filters.departments.active && filters.departments.names.length > 0) {
    filters.departments.names.forEach((d) => params.append("department", d));
  }

  if (filters.units.active) {
    params.append("unitsMin", filters.units.min.toString());
    params.append("unitsMax", filters.units.max.toString());
  }

  if (filters.semesters.active) {
    filters.semesters.sessions.forEach((s: Session) => params.append("session", JSON.stringify(s)));
  }

  if (filters.levels.active) {
    let value = "";
    filters.levels.selected.forEach((elem, index) => {
      if (elem) value += index.toString();
    });

    if (value) params.append("levels", value);
  }

  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
    },
    params,
  });

  return response.data;
};

export const useFetchCourseInfosByPage = () => {
  const filters = useAppSelector((state) => state.filters);
  const page = useAppSelector((state) => state.filters.page);

  return useQuery({
    queryKey: ['courseInfosByPage', filters, page],
    queryFn: () => fetchCourseInfosByPage(filters, page),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  });
};

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
