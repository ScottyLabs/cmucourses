import { Profile } from "@cmucourses/profile";

/** The profile page's sections, in page order, with what counts as "filled in". */
export const PROFILE_SECTIONS: {
  id: string;
  title: string;
  isComplete: (profile: Profile) => boolean;
}[] = [
  {
    id: "public-info",
    title: "Public info",
    isComplete: (p) => !!p.displayName,
  },
  {
    id: "academic",
    title: "Academic background",
    isComplete: (p) =>
      !!p.academic?.degree &&
      !!p.academic.college &&
      p.academic.majors.length > 0,
  },
  {
    id: "careers",
    title: "Career goals",
    isComplete: (p) => p.careers.length > 0,
  },
  {
    id: "skills",
    title: "Skills",
    isComplete: (p) => p.skillsHave.length + p.skillsWant.length > 0,
  },
  {
    id: "workload",
    title: "Course load",
    isComplete: (p) =>
      !!p.workload && Object.values(p.workload).some((value) => value !== null),
  },
  {
    id: "time",
    title: "Time & format",
    isComplete: (p) => p.modality !== null,
  },
  { id: "courses", title: "Courses", isComplete: (p) => p.courses.length > 0 },
  {
    id: "plan",
    title: "Future course plan",
    isComplete: (p) => p.plannedCourses.length > 0,
  },
];
