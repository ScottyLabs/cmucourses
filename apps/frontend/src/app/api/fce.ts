import axios from "axios";
import { FCE } from "~/types";
import { useQueries, useQuery, keepPreviousData } from "@tanstack/react-query";
import { STALE_TIME } from "~/app/constants";
import { create, keyResolver, windowScheduler } from "@yornaath/batshit";

const fetchFCEInfosByCourseBatcher = create({
  fetcher: async (
    courseIDs: string[]
  ): Promise<{ courseID: string; fces: FCE[] }[]> => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/fces`;
    const params = new URLSearchParams();

    courseIDs.forEach((courseID) => params.append("courseID", courseID));

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
      params,
    });

    return courseIDs.map((courseID) => ({
      courseID,
      fces: response.data.filter((fce: FCE) => fce.courseID === courseID),
    }));
  },
  resolver: keyResolver("courseID"),
  scheduler: windowScheduler(10),
});

export const useFetchFCEInfoByCourse = (courseID: string) => {
  return useQuery({
    queryKey: ["fces", { courseID }],
    queryFn: () => fetchFCEInfosByCourseBatcher.fetch(courseID),
    staleTime: STALE_TIME,
  });
};

export const useFetchFCEInfosByCourse = (courseIDs: string[]) => {
  return useQueries({
    queries: courseIDs.map((courseID) => ({
      queryKey: ["fces", { courseID }],
      queryFn: () => fetchFCEInfosByCourseBatcher.fetch(courseID),
      staleTime: STALE_TIME,
      placeholderData: { courseID, fces: [] },
    })),
    combine: (result) => {
      return result.reduce((acc, { data }) => {
        if (data) acc.push(data);
        return acc;
      }, [] as FCE[]);
    },
  });
};

const fetchFCEInfosByInstructorBatcher = create({
  fetcher: async (
    instructors: string[]
  ): Promise<{ instructor: string; fces: FCE[] }[]> => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/fces`;
    const params = new URLSearchParams();

    instructors.forEach((instructor) => params.append("instructor", instructor));

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
      params,
    });

    return instructors.map((instructor) => ({
      instructor,
      fces: response.data.filter((fce: FCE) => fce.instructor === instructor),
    }));
  },
  resolver: keyResolver("instructor"),
  scheduler: windowScheduler(10),
});

export const useFetchFCEInfosByInstructor = (instructor: string) => {
  return useQuery({
    queryKey: ["instructorFCEs", { instructor }],
    queryFn: () => fetchFCEInfosByInstructorBatcher.fetch(instructor),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  });
};
