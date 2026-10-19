import axios from "axios";
import { Gened } from "~/app/types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { STALE_TIME } from "~/app/constants";

const fetchGenedsBySchool = async (selectedSchool: string): Promise<Gened[]> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/geneds`;

  const params = new URLSearchParams();
  params.append("school", selectedSchool);

  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
    },
    params,
  });
  return response.data;
};

export const useFetchGenedsBySchool = (selectedSchool: string) => {
  return useQuery({
    queryKey: ["geneds", { selectedSchool }],
    queryFn: () => fetchGenedsBySchool(selectedSchool),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  });
};
