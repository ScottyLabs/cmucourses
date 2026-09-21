import {
  generateSchedules,
  type CandidateCourse,
  type GenLecture,
  type GeneratorInput,
  type Profile,
  type ScheduleCandidate,
} from "@cmucourses/profile";
import { Course, Schedule } from "~/app/types";
import { isValidUnits, parseUnits, sessionToString } from "~/app/utils";

export type { ScheduleCandidate } from "@cmucourses/profile";

const toGenLectures = (schedule: Schedule | undefined): GenLecture[] => {
  if (!schedule) return [];
  return schedule.lectures.map((lecture) => ({
    name: lecture.name,
    times: lecture.times.map((time) => ({
      ...time,
      location: lecture.location,
    })),
    sections: schedule.sections
      .filter((section) => section.lecture === lecture.name)
      .map((section) => ({
        name: section.name,
        times: section.times.map((time) => ({
          ...time,
          location: section.location,
        })),
      })),
  }));
};

/** Builds the generator's input from the catalog data already fetched for a course list. */
export const buildGeneratorInput = (
  courseIDs: string[],
  courseDetails: Course[],
  selectedSession: string,
  profile: Profile
): GeneratorInput => {
  const courses: CandidateCourse[] = courseIDs.map((courseID) => {
    const course = courseDetails.find((c) => c.courseID === courseID);
    const schedule = course?.schedules?.find(
      (s) => sessionToString(s) === selectedSession
    );
    const units =
      course?.units && isValidUnits(course.units)
        ? parseUnits(course.units)
        : 0;
    return { courseID, units, lectures: toGenLectures(schedule) };
  });

  return {
    courses,
    busyBlocks: profile.busyBlocks,
    workload: profile.workload,
    careers: profile.careers,
    skillsWant: profile.skillsWant,
    skillsHave: profile.skillsHave,
    preferences: profile.schedulePreferences,
    preferredModality: profile.modality,
  };
};

export const generateCandidates = (
  input: GeneratorInput
): ScheduleCandidate[] => generateSchedules(input);
