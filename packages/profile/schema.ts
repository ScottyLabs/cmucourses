import { z } from "zod";
import { CAREERS } from "./taxonomy/careers";
import { SKILLS } from "./taxonomy/skills";
import { COLLEGES, MAJORS, majorsForCollege, MINORS } from "./taxonomy/colleges";
import { labelOf, TaxonomyItem } from "./taxonomy/types";

export const MODALITIES = ["IN_PERSON", "REMOTE", "HYBRID"] as const;
export const COURSE_STATUSES = ["TAKEN", "IN_PROGRESS"] as const;
export const DEGREE_LEVELS = ["UNDERGRAD", "MASTERS", "PHD"] as const;
export const VISIBILITIES = ["PUBLIC", "PRIVATE"] as const;
export const PROFILE_SEMESTERS = ["fall", "spring", "summer"] as const;

/** Sections that can be shared later. Everything not listed here is always private. */
export const SHAREABLE_SECTIONS = ["academic", "careers", "skills", "courses"] as const;

export const LIMITS = {
  displayName: 50,
  bio: 500,
  careers: 3,
  majors: 3,
  minors: 3,
  skills: 30,
  busyBlocks: 50,
  busyBlockLabel: 40,
  courses: 200,
  plannedCourses: 100,
  units: 60,
  hoursPerWeek: 100,
} as const;

export type Modality = (typeof MODALITIES)[number];
export type CourseStatus = (typeof COURSE_STATUSES)[number];
export type DegreeLevel = (typeof DEGREE_LEVELS)[number];
export type Visibility = (typeof VISIBILITIES)[number];
export type ProfileSemester = (typeof PROFILE_SEMESTERS)[number];
export type ShareableSection = (typeof SHAREABLE_SECTIONS)[number];

/** Same rule as the backend's standardizeID: "15122" -> "15-122". */
export const standardizeCourseID = (id: string): string => {
  const trimmed = id.trim();
  if (!trimmed.includes("-") && trimmed.length >= 5) {
    return trimmed.slice(0, 2) + "-" + trimmed.slice(2);
  }
  return trimmed;
};

const COURSE_ID_REGEX = /^\d{2}-\d{3}$/;

const taxonomyID = (items: readonly TaxonomyItem[], name: string) => {
  const ids = new Set(items.map((item) => item.id));
  // Deprecated ids stay valid so that re-saving an old profile never fails.
  return z.string().refine(
    (id) => ids.has(id),
    (id) => ({ message: `Unknown ${name} "${id}"` })
  );
};

const uniqueList = <T extends z.ZodTypeAny>(item: T, max: number, name: string) =>
  z
    .array(item)
    .max(max, `At most ${max} ${name}`)
    .refine((list) => new Set(list).size === list.length, `Duplicate ${name}`);

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .transform((text) => (text === "" ? null : text));

const nullableInt = (min: number, max: number) => z.number().int().min(min).max(max).nullable();

export const academicSchema = z
  .object({
    college: taxonomyID(COLLEGES, "college").nullable(),
    majors: uniqueList(taxonomyID(MAJORS, "major"), LIMITS.majors, "majors"),
    minors: uniqueList(taxonomyID(MINORS, "minor"), LIMITS.minors, "minors"),
    degree: z.enum(DEGREE_LEVELS).nullable(),
    gradSemester: z.enum(PROFILE_SEMESTERS).nullable(),
    gradYear: nullableInt(2000, 2100),
  })
  .strict()
  .superRefine(({ college, majors }, ctx) => {
    const allowed = new Set(majorsForCollege(college).map((major) => major.id));
    majors.forEach((id, index) => {
      if (!allowed.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["majors", index],
          message: `${labelOf(MAJORS, id)} isn't offered by ${labelOf(COLLEGES, college ?? "")}`,
        });
      }
    });
  });

export const workloadSchema = z
  .object({
    unitsMin: nullableInt(0, LIMITS.units),
    unitsMax: nullableInt(0, LIMITS.units),
    hoursPerWeek: nullableInt(0, LIMITS.hoursPerWeek),
  })
  .strict()
  .refine(({ unitsMin, unitsMax }) => unitsMin === null || unitsMax === null || unitsMin <= unitsMax, {
    message: "Minimum units must not exceed maximum units",
    path: ["unitsMin"],
  });

export const busyBlockSchema = z
  .object({
    day: z.number().int().min(0).max(6), // 0 = Sunday
    begin: z.number().int().min(0).max(1439), // minutes after midnight
    end: z.number().int().min(1).max(1440),
    label: nullableText(LIMITS.busyBlockLabel).optional().default(null),
  })
  .strict()
  .refine(({ begin, end }) => begin < end, { message: "Start time must be before end time", path: ["end"] });

export const courseRecordSchema = z
  .object({
    courseID: z
      .string()
      .transform(standardizeCourseID)
      .refine(
        (id) => COURSE_ID_REGEX.test(id),
        (id) => ({ message: `Invalid course ID "${id}"` })
      ),
    status: z.enum(COURSE_STATUSES),
    semester: z.enum(PROFILE_SEMESTERS).nullable(),
    year: z
      .string()
      .regex(/^\d{4}$/, "Year must be four digits")
      .nullable(),
  })
  .strict();

export const schedulePreferencesSchema = z
  .object({
    earliestStart: nullableInt(0, 1439),
    latestEnd: nullableInt(1, 1440),
    preferredDays: uniqueList(z.number().int().min(0).max(6), 7, "preferred days"),
    compactDays: z.boolean(),
  })
  .strict()
  .refine(({ earliestStart, latestEnd }) => earliestStart === null || latestEnd === null || earliestStart < latestEnd, {
    message: "Preferred start time must be before the preferred end time",
    path: ["latestEnd"],
  });

export const plannedCourseSchema = z
  .object({
    courseID: z
      .string()
      .transform(standardizeCourseID)
      .refine(
        (id) => COURSE_ID_REGEX.test(id),
        (id) => ({ message: `Invalid course ID "${id}"` })
      ),
    semester: z.enum(PROFILE_SEMESTERS),
    year: z.string().regex(/^\d{4}$/, "Year must be four digits"),
  })
  .strict();

export const visibilitySchema = z
  .object({
    academic: z.enum(VISIBILITIES),
    careers: z.enum(VISIBILITIES),
    skills: z.enum(VISIBILITIES),
    courses: z.enum(VISIBILITIES),
  })
  .strict();

/**
 * Body of PATCH /user/profile. Every top-level key that is present replaces that whole
 * section; absent keys are left untouched.
 */
export const profilePatchSchema = z
  .object({
    displayName: nullableText(LIMITS.displayName),
    bio: nullableText(LIMITS.bio),
    careers: uniqueList(taxonomyID(CAREERS, "career"), LIMITS.careers, "careers"),
    skillsHave: uniqueList(taxonomyID(SKILLS, "skill"), LIMITS.skills, "skills"),
    skillsWant: uniqueList(taxonomyID(SKILLS, "skill"), LIMITS.skills, "skills"),
    academic: academicSchema,
    workload: workloadSchema,
    modality: z.enum(MODALITIES).nullable(),
    busyBlocks: z.array(busyBlockSchema).max(LIMITS.busyBlocks, `At most ${LIMITS.busyBlocks} busy times`),
    schedulePreferences: schedulePreferencesSchema,
    courses: z
      .array(courseRecordSchema)
      .max(LIMITS.courses, `At most ${LIMITS.courses} courses`)
      // A course appears once; the last entry for a course wins.
      .transform((records) => [...new Map(records.map((record) => [record.courseID, record])).values()]),
    plannedCourses: z
      .array(plannedCourseSchema)
      .max(LIMITS.plannedCourses, `At most ${LIMITS.plannedCourses} planned courses`)
      .transform((records) => [
        ...new Map(records.map((record) => [`${record.year}:${record.semester}:${record.courseID}`, record])).values(),
      ]),
    visibility: visibilitySchema,
    completeOnboarding: z.literal(true),
  })
  .partial()
  .strict();

export type Academic = z.output<typeof academicSchema>;
export type Workload = z.output<typeof workloadSchema>;
export type BusyBlock = z.output<typeof busyBlockSchema>;
export type CourseRecord = z.output<typeof courseRecordSchema>;
export type SchedulePreferences = z.output<typeof schedulePreferencesSchema>;
export type PlannedCourse = z.output<typeof plannedCourseSchema>;
export type ProfileVisibility = z.output<typeof visibilitySchema>;
/** What the client sends. */
export type ProfilePatchInput = z.input<typeof profilePatchSchema>;
/** What the server applies after validation and normalization. */
export type ProfilePatch = z.output<typeof profilePatchSchema>;

/** The profile as returned by the API (dates are ISO strings on the wire). */
export interface Profile {
  displayName: string | null;
  bio: string | null;
  careers: string[];
  skillsHave: string[];
  skillsWant: string[];
  academic: Academic | null;
  workload: Workload | null;
  modality: Modality | null;
  busyBlocks: BusyBlock[];
  schedulePreferences: SchedulePreferences;
  courses: CourseRecord[];
  plannedCourses: PlannedCourse[];
  visibility: ProfileVisibility;
  onboardedAt: string | null;
  updatedAt: string | null;
}

export const DEFAULT_VISIBILITY: ProfileVisibility = {
  academic: "PRIVATE",
  careers: "PRIVATE",
  skills: "PRIVATE",
  courses: "PRIVATE",
};

export const DEFAULT_SCHEDULE_PREFERENCES: SchedulePreferences = {
  earliestStart: null,
  latestEnd: null,
  preferredDays: [],
  compactDays: false,
};

/** The profile of a signed-in user who has never saved anything. */
export const emptyProfile = (): Profile => ({
  displayName: null,
  bio: null,
  careers: [],
  skillsHave: [],
  skillsWant: [],
  academic: null,
  workload: null,
  modality: null,
  busyBlocks: [],
  schedulePreferences: { ...DEFAULT_SCHEDULE_PREFERENCES },
  courses: [],
  plannedCourses: [],
  visibility: { ...DEFAULT_VISIBILITY },
  onboardedAt: null,
  updatedAt: null,
});

export const RATING_TARGET_TYPES = ["COURSE", "INSTRUCTOR"] as const;
export type RatingTargetType = (typeof RATING_TARGET_TYPES)[number];

export const RATING_LIMITS = { comment: 1000, wishIKnew: 1000 } as const;

/**
 * Body of PATCH /user/rating. `wishIKnew` is accepted for either target type at the schema
 * level (Mongo has no per-branch cost) but the frontend only renders that field for courses.
 */
export const ratingPatchSchema = z
  .object({
    targetType: z.enum(RATING_TARGET_TYPES),
    targetID: z.string().trim().min(1).max(100),
    stars: z.number().int().min(1).max(5),
    comment: nullableText(RATING_LIMITS.comment).optional(),
    wishIKnew: nullableText(RATING_LIMITS.wishIKnew).optional(),
  })
  .strict()
  .transform(({ targetType, targetID, ...rest }) => ({
    ...rest,
    targetType,
    targetID: targetType === "COURSE" ? standardizeCourseID(targetID) : targetID,
  }));

/** What the client sends. */
export type RatingPatchInput = z.input<typeof ratingPatchSchema>;
/** What the server applies after validation and normalization. */
export type RatingPatch = z.output<typeof ratingPatchSchema>;
