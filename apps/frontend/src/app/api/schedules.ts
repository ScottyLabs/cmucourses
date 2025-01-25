import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "~/app/constants";
import { create, keyResolver, windowScheduler } from "@yornaath/batshit";
import { Schedule } from "~/app/types";

const fetchSchedulesByInstructorBatcher = create({
  fetcher: async (
    instructors: string[]
  ): Promise<{ instructor: string; schedules: Schedule[] }[]> => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/schedules`;
    const params = new URLSearchParams();

    instructors.forEach((instructor) =>
      params.append("instructor", instructor)
    );

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
      params,
    });

    return instructors.map((instructor) => ({
      instructor,
      schedules: response.data.filter((schedule: Schedule) =>
        schedule.instructors?.some((i) => i === instructor)
      ),
    }));
  },
  resolver: keyResolver("instructor"),
  scheduler: windowScheduler(10),
});

export const useFetchSchedulesByInstructor = (instructor: string) => {
  return useQuery({
    queryKey: ["schedules", { instructor }],
    queryFn: () => fetchSchedulesByInstructorBatcher.fetch(instructor),
    staleTime: STALE_TIME,
  });
};
