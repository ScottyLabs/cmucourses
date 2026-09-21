import { z } from "zod";
import { PROFILE_SEMESTERS, standardizeCourseID } from "./schema";

export const SOCIAL_REACTIONS = ["👍", "🎉", "🔥", "📚"] as const;

const publishedCourseSchema = z
  .object({
    courseID: z
      .string()
      .transform(standardizeCourseID)
      .refine((value) => /^\d{2}-\d{3}$/.test(value), "Invalid course ID"),
    lecture: z.string().max(50).nullable(),
    section: z.string().max(50).nullable(),
  })
  .strict();

export const publishedScheduleSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    semester: z.enum(PROFILE_SEMESTERS),
    year: z.string().regex(/^\d{4}$/),
    courses: z.array(publishedCourseSchema).max(30),
  })
  .strict();

export const publishScheduleInputSchema = z.object({ schedule: publishedScheduleSchema.nullable() }).strict();

export const followInputSchema = z
  .object({
    profileID: z.string().regex(/^[a-f\d]{24}$/i, "Invalid profile ID"),
    follow: z.boolean(),
  })
  .strict();

export const reactionInputSchema = z
  .object({
    profileID: z.string().regex(/^[a-f\d]{24}$/i, "Invalid profile ID"),
    reaction: z.enum(SOCIAL_REACTIONS).nullable(),
  })
  .strict();

export type PublishedSchedule = z.output<typeof publishedScheduleSchema>;
export type SocialReaction = (typeof SOCIAL_REACTIONS)[number];

export interface SocialDirectoryProfile {
  profileID: string;
  displayName: string;
  bio: string | null;
  careers: string[];
  skills: string[];
  currentCourseIDs: string[];
  plannedSchedule: PublishedSchedule | null;
  following: boolean;
  myReaction: SocialReaction | null;
  reactions: Partial<Record<SocialReaction, number>>;
}
