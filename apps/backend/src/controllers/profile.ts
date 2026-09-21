import { RequestHandler } from "express";
import db from "@cmucourses/db";
import {
  DEFAULT_SCHEDULE_PREFERENCES,
  DEFAULT_VISIBILITY,
  emptyProfile,
  Profile,
  PROFILE_SEMESTERS,
  profilePatchSchema,
  ProfilePatchInput,
  ProfileSemester,
} from "@cmucourses/profile";
import { PrismaReturn } from "~/util";
import { UserLocals } from "~/controllers/user";

type ProfileDoc = NonNullable<PrismaReturn<typeof db.profiles.findUnique>>;

type ValidationError = {
  error: "ValidationError";
  issues: { path: (string | number)[]; message: string }[];
};

// Semesters are plain strings in Mongo; anything unexpected reads back as unset.
const toSemester = (semester: string | null | undefined): ProfileSemester | null =>
  PROFILE_SEMESTERS.find((known) => known === semester) ?? null;

const toProfile = (doc: ProfileDoc): Profile => ({
  displayName: doc.displayName,
  bio: doc.bio,
  careers: doc.careers,
  skillsHave: doc.skillsHave,
  skillsWant: doc.skillsWant,
  academic: doc.academic && {
    college: doc.academic.college ?? null,
    majors: doc.academic.majors,
    minors: doc.academic.minors,
    degree: doc.academic.degree ?? null,
    gradSemester: toSemester(doc.academic.gradSemester),
    gradYear: doc.academic.gradYear ?? null,
  },
  workload: doc.workload && {
    unitsMin: doc.workload.unitsMin ?? null,
    unitsMax: doc.workload.unitsMax ?? null,
    hoursPerWeek: doc.workload.hoursPerWeek ?? null,
  },
  modality: doc.modality,
  busyBlocks: doc.busyBlocks.map(({ day, begin, end, label }) => ({ day, begin, end, label: label ?? null })),
  schedulePreferences: doc.schedulePreferences
    ? {
        earliestStart: doc.schedulePreferences.earliestStart ?? null,
        latestEnd: doc.schedulePreferences.latestEnd ?? null,
        preferredDays: doc.schedulePreferences.preferredDays,
        compactDays: doc.schedulePreferences.compactDays,
      }
    : { ...DEFAULT_SCHEDULE_PREFERENCES },
  courses: doc.courses.map(({ courseID, status, semester, year }) => ({
    courseID,
    status,
    semester: toSemester(semester),
    year: year ?? null,
  })),
  plannedCourses: (doc.plannedCourses ?? []).map(({ courseID, semester, year }) => ({
    courseID,
    semester: toSemester(semester) ?? "fall",
    year,
  })),
  visibility: doc.visibility,
  onboardedAt: doc.onboardedAt?.toISOString() ?? null,
  updatedAt: doc.updatedAt.toISOString(),
});

export interface GetProfile {
  params: unknown;
  resBody: Profile;
  reqBody: { token: string };
  query: unknown;
}

export const getProfile: RequestHandler<
  GetProfile["params"],
  GetProfile["resBody"],
  GetProfile["reqBody"],
  GetProfile["query"],
  UserLocals
> = async (req, res, next) => {
  try {
    const doc = await db.profiles.findUnique({ where: { clerkUserId: res.locals.userId } });
    res.json(doc ? toProfile(doc) : emptyProfile());
  } catch (e) {
    next(e);
  }
};

export interface PatchProfile {
  params: unknown;
  resBody: Profile | ValidationError;
  reqBody: { token: string; profile: ProfilePatchInput };
  query: unknown;
}

export const patchProfile: RequestHandler<
  PatchProfile["params"],
  PatchProfile["resBody"],
  PatchProfile["reqBody"],
  PatchProfile["query"],
  UserLocals
> = async (req, res, next) => {
  const parsed = profilePatchSchema.safeParse(req.body.profile);
  if (!parsed.success) {
    res.status(400).json({
      error: "ValidationError",
      issues: parsed.error.issues.map(({ path, message }) => ({ path, message })),
    });
    return;
  }

  // Every section present in the patch replaces the stored one wholesale.
  const { completeOnboarding, ...sections } = parsed.data;
  const onboarding = completeOnboarding ? { onboardedAt: new Date() } : {};

  try {
    const doc = await db.profiles.upsert({
      where: { clerkUserId: res.locals.userId },
      update: { ...sections, ...onboarding },
      create: {
        ...sections,
        ...onboarding,
        clerkUserId: res.locals.userId,
        visibility: sections.visibility ?? DEFAULT_VISIBILITY,
      },
    });
    res.json(toProfile(doc));
  } catch (e) {
    next(e);
  }
};
