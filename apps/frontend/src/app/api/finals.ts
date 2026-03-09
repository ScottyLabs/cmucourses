import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "~/app/constants";

export type SearchResult = {
  courseID: string;
  name: string;
};

export type SearchResponse = {
  docs: SearchResult[];
  totalDocs: number;
  totalPages: number;
  page: number;
};

const fetchCourseSearch = async (keywords: string): Promise<SearchResult[]> => {
  if (!keywords.trim()) {
    return [];
  }

  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/courses/search?`;
  const params = new URLSearchParams({
    keywords,
    page: "1",
    pageSize: "100", // Get up to 100 results
  });

  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
    },
    params,
  });

  return response.data.docs ?? [];
};

export const useFetchFinalsSearch = (keywords: string) => {
  return useQuery({
    queryKey: ["finalsSearch", keywords],
    queryFn: () => fetchCourseSearch(keywords),
    staleTime: STALE_TIME,
    enabled: keywords.trim().length > 0,
  });
};