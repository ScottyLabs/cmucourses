import axios from "axios";
import { useQuery, useQueries, keepPreviousData } from "@tanstack/react-query";
import { create, windowScheduler, keyResolver } from "@yornaath/batshit";
import { STALE_TIME } from "~/app/constants";
import { Syllabus } from "~/app/types";

export type FetchAllSyllabiResult = {
  number: string;
  name: string;
}[];

const fetchSyllabi = async (numbers: string[]): Promise<Syllabus[]> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/syllabi`;
    
    const params = new URLSearchParams(
      numbers.map((number) => ["number", number])
    );

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching syllabi:", error);
    return [];
  }
};

export const useFetchSyllabi = (numbers: string[]) => {
  return useQuery({
    queryKey: ["syllabi", numbers],
    queryFn: () => fetchSyllabi(numbers),
    staleTime: STALE_TIME,
    enabled: numbers.length > 0,
  });
};

const fetchSyllabusBatcher = create({
  fetcher: async (syllabusNumbers: string[]): Promise<Syllabus[]> => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/syllabi`;
      const params = new URLSearchParams(
        syllabusNumbers.map((number) => ["number", number])
      );

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
        },
        params,
      });

      return response.data;
    } catch (error) {
      console.error("Error in syllabus batcher:", error);
      return []; 
    }
  },
  resolver: keyResolver("number"),
  scheduler: windowScheduler(10),
});

export const useFetchSyllabus = (number: string) => {
  return useQuery({
    queryKey: ["syllabus", { number }],
    queryFn: () => fetchSyllabusBatcher.fetch(number),
    staleTime: STALE_TIME,
    enabled: !!number,
  });
};

export const useFetchMultipleSyllabi = (numbers: string[]) => {
  return useQueries({
    queries: numbers.map((number) => ({
      queryKey: ["syllabus", { number }],
      queryFn: () => fetchSyllabusBatcher.fetch(number),
      staleTime: STALE_TIME,
      enabled: !!number,
    })),
    combine: (result) => {
      return result.reduce((acc, { data }) => {
        if (data) acc.push(data);
        return acc;
      }, [] as Syllabus[]);
    },
  });
};

const fetchAllSyllabi = async (): Promise<FetchAllSyllabiResult> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/syllabi/all`;

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching all syllabi:", error);
    return []; 
  }
};

export const useFetchAllSyllabi = () => {
  return useQuery({
    queryKey: ["allSyllabi"],
    queryFn: fetchAllSyllabi,
    staleTime: STALE_TIME,
    retry: false,
  });
};