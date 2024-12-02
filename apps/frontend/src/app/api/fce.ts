import axios from "axios";
import { FCE } from "~/types";
import { GetToken } from "@clerk/types";
import { useQueries, useQuery, keepPreviousData } from "@tanstack/react-query";
import { STALE_TIME } from "~/app/constants";
import { create, keyResolver, windowScheduler } from "@yornaath/batshit";
import { memoize } from "lodash-es";
import { useAuth } from "@clerk/nextjs";

const fetchFCEInfosByCourseBatcher = memoize((isSignedIn: boolean | undefined, getToken: GetToken) => {
  return create({
    fetcher: async (courseIDs: string[]): Promise<{ courseID: string; fces: FCE[]; }[]> => {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/fces`;
      const params = new URLSearchParams();

      courseIDs.forEach((courseID) => params.append("courseID", courseID));

      const token = await getToken();

      if (isSignedIn && token) {
        const response = await axios.post(url, {token}, {
          headers: {
            "Content-Type": "application/json",
          },
          params,
        });

        return courseIDs.map((courseID) => ({
          courseID,
          fces: response.data.filter((fce: FCE) => fce.courseID === courseID)
        }));
      }
      return courseIDs.map((courseID) => ({courseID, fces: []}));
    },
    resolver: keyResolver("courseID"),
    scheduler: windowScheduler(10),
  });
});

export const useFetchFCEInfoByCourse = (courseID: string) => {
  const { isSignedIn, getToken } = useAuth();

  return useQuery({
    queryKey: ['fces', { courseID, isSignedIn }],
    queryFn: () => fetchFCEInfosByCourseBatcher(isSignedIn, getToken).fetch(courseID),
    staleTime: STALE_TIME,
  });
};

export const useFetchFCEInfosByCourse = (courseIDs: string[], isSignedIn: boolean | undefined, getToken: GetToken) => {
  return useQueries({
    queries: courseIDs.map((courseID) => ({
      queryKey: ['fces', { courseID, isSignedIn }],
      queryFn: () => fetchFCEInfosByCourseBatcher(isSignedIn, getToken).fetch(courseID),
      staleTime: STALE_TIME,
      placeholderData: {courseID, fces: []},
    })),
    combine: result => {
      return result.reduce((acc, {data}) => {
        if (data) acc.push(data);
        return acc;
      }, [] as FCE[]);
    },
  });
};

const fetchFCEInfosByInstructorBatcher = memoize((isSignedIn: boolean | undefined, getToken: GetToken) => {
  return create({
    fetcher: async (instructors: string[]): Promise<{ instructor: string; fces: FCE[]; }[]> => {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/fces`;
      const params = new URLSearchParams();

      instructors.forEach((instructor) => params.append("instructor", instructor));

      const token = await getToken();

      if (isSignedIn && token) {
        const response = await axios.post(url, { token }, {
          headers: {
            "Content-Type": "application/json",
          },
          params,
        });

        return instructors.map((instructor) => ({
          instructor,
          fces: response.data.filter((fce: FCE) => fce.instructor === instructor)
        }));
      }
      return [];
    },
    resolver: keyResolver("instructor"),
    scheduler: windowScheduler(10),
  });
});


export const useFetchFCEInfosByInstructor = (instructor: string, isSignedIn: boolean | undefined, getToken: GetToken) => {
  return useQuery({
    queryKey: ['instructorFCEs', { instructor, isSignedIn }],
    queryFn: () => fetchFCEInfosByInstructorBatcher(isSignedIn, getToken).fetch(instructor),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  });
};
