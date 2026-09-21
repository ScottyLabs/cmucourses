import {
  Academic,
  CourseStatus,
  DegreeLevel,
  Modality,
  ProfileSemester,
} from "@cmucourses/profile";
import { SelectOption } from "./fields";

export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Lets an optional field be cleared back to "not set". */
export const NONE_OPTION = { value: null, label: "None" } as const;

export const DAY_OPTIONS: SelectOption<number>[] = DAYS.map((label, value) => ({
  value,
  label,
}));

export const DEGREE_OPTIONS: SelectOption<DegreeLevel | null>[] = [
  NONE_OPTION,
  { value: "UNDERGRAD", label: "Undergraduate" },
  { value: "MASTERS", label: "Master's" },
  { value: "PHD", label: "PhD" },
];

export const SEMESTER_OPTIONS: SelectOption<ProfileSemester | null>[] = [
  NONE_OPTION,
  { value: "fall", label: "Fall" },
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
];

export const STATUS_OPTIONS: SelectOption<CourseStatus>[] = [
  { value: "TAKEN", label: "Taken" },
  { value: "IN_PROGRESS", label: "In progress" },
];

export const MODALITY_OPTIONS: SelectOption<Modality>[] = [
  { value: "IN_PERSON", label: "In person" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
];

const thisYear = new Date().getFullYear();

/** Years a course could have been taken in. */
export const PAST_YEAR_OPTIONS: SelectOption<string | null>[] = [
  NONE_OPTION,
  ...Array.from({ length: 8 }, (_, i) => {
    const year = String(thisYear + 1 - i);
    return { value: year, label: year };
  }),
];

export const PLAN_YEAR_OPTIONS: SelectOption<string>[] = Array.from(
  { length: 6 },
  (_, i) => {
    const year = String(thisYear + i);
    return { value: year, label: year };
  }
);

/** Years a student could graduate in. */
export const GRAD_YEAR_OPTIONS: SelectOption<number | null>[] = [
  NONE_OPTION,
  ...Array.from({ length: 9 }, (_, i) => ({
    value: thisYear - 1 + i,
    label: String(thisYear - 1 + i),
  })),
];

export const EMPTY_ACADEMIC: Academic = {
  college: null,
  majors: [],
  minors: [],
  degree: null,
  gradSemester: null,
  gradYear: null,
};

export const minutesToTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

export const timeToMinutes = (time: string): number | null => {
  const [hours, minutes] = time.split(":").map((part) => parseInt(part));
  if (
    hours === undefined ||
    minutes === undefined ||
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  )
    return null;
  return hours * 60 + minutes;
};
