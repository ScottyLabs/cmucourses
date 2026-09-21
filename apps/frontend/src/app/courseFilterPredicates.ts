import {
  availabilityFit,
  meetingGroupsFor,
  parseCatalogTime,
  type BusyBlock,
  type Modality,
} from "@cmucourses/profile";
import type { Course, Schedule, Time } from "./types";

export interface ClientCourseFilters {
  meetingDays?: number[];
  timeRange?: { begin: number; end: number };
  modalities?: Modality[];
  fitAvailability?: boolean;
}

const allTimes = (schedule: Schedule): Time[] => [
  ...schedule.lectures.flatMap((lecture) => lecture.times || []),
  ...schedule.sections.flatMap((section) => section.times || []),
];

const modalityFor = (schedule: Schedule): Modality | null => {
  const locations = [...schedule.lectures, ...schedule.sections]
    .flatMap((meeting) =>
      meeting.times.length > 0
        ? meeting.times.map((time) =>
            `${meeting.location ?? ""} ${time.building ?? ""} ${time.room ?? ""}`.trim()
          )
        : [meeting.location ?? ""]
    )
    .filter(Boolean);
  if (locations.length === 0) return null;
  const remote = locations.filter((location) =>
    /remote|online|zoom/i.test(location)
  ).length;
  if (remote === locations.length) return "REMOTE";
  if (remote > 0) return "HYBRID";
  return "IN_PERSON";
};

const meetingMatches = (
  time: Time,
  days: number[] | undefined,
  range: ClientCourseFilters["timeRange"]
) => {
  if (days && days.length > 0 && !time.days.every((day) => days.includes(day)))
    return false;
  if (!range) return true;
  const begin = parseCatalogTime(time.begin);
  const end = parseCatalogTime(time.end);
  return (
    begin !== null && end !== null && begin >= range.begin && end <= range.end
  );
};

export const courseMatchesClientFilters = (
  course: Course,
  filters: ClientCourseFilters,
  busyBlocks: BusyBlock[]
): boolean => {
  const schedules = course.schedules ?? [];
  if (schedules.length === 0) return false;

  if (filters.meetingDays || filters.timeRange) {
    const matches = schedules.some((schedule) =>
      allTimes(schedule).some((time) =>
        meetingMatches(time, filters.meetingDays, filters.timeRange)
      )
    );
    if (!matches) return false;
  }

  if (filters.modalities && filters.modalities.length > 0) {
    if (
      !schedules.some((schedule) => {
        const modality = modalityFor(schedule);
        return modality !== null && filters.modalities?.includes(modality);
      })
    )
      return false;
  }

  if (filters.fitAvailability) {
    if (busyBlocks.length === 0) return false;
    const fits = schedules.some((schedule) => {
      const groups = meetingGroupsFor(schedule.lectures, schedule.sections);
      return availabilityFit(groups, busyBlocks).status === "FITS";
    });
    if (!fits) return false;
  }

  return true;
};
