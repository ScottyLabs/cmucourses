import { RequestHandler } from "express";
import db from "@cmucourses/db";
import {
  followInputSchema,
  publishScheduleInputSchema,
  reactionInputSchema,
  SOCIAL_REACTIONS,
  type SocialDirectoryProfile,
  type SocialReaction,
} from "@cmucourses/profile";
import { UserLocals } from "./user";

type ErrorBody = { error: string };

export const getSocialDirectory: RequestHandler<
  unknown,
  SocialDirectoryProfile[] | ErrorBody,
  { token: string },
  unknown,
  UserLocals
> = async (_req, res, next) => {
  try {
    const profiles = await db.profiles.findMany({
      where: { clerkUserId: { not: res.locals.userId } },
      take: 100,
    });
    const userIDs = profiles.map((profile) => profile.clerkUserId);
    const profileIDs = profiles.map((profile) => profile.id);
    const [schedules, follows, reactions] = await Promise.all([
      db.socialSchedules.findMany({
        where: { clerkUserId: { in: userIDs } },
      }),
      db.follows.findMany({
        where: { followerUserId: res.locals.userId },
      }),
      db.scheduleReactions.findMany({
        where: { targetProfileId: { in: profileIDs } },
      }),
    ]);

    const scheduleByUser = new Map(schedules.map((schedule) => [schedule.clerkUserId, schedule]));
    const followed = new Set(follows.map((follow) => follow.followedProfileId));

    res.json(
      profiles.map((profile) => {
        const schedule = scheduleByUser.get(profile.clerkUserId);
        const profileReactions = reactions.filter((reaction) => reaction.targetProfileId === profile.id);
        const counts: Partial<Record<SocialReaction, number>> = {};
        for (const reaction of profileReactions) {
          if (!SOCIAL_REACTIONS.includes(reaction.reaction as SocialReaction)) continue;
          const value = reaction.reaction as SocialReaction;
          counts[value] = (counts[value] ?? 0) + 1;
        }
        const ownReaction = profileReactions.find((reaction) => reaction.reactorUserId === res.locals.userId)?.reaction;

        return {
          profileID: profile.id,
          displayName: profile.displayName || "CMU student",
          bio: profile.bio,
          careers: profile.visibility.careers === "PUBLIC" ? profile.careers : [],
          skills: profile.visibility.skills === "PUBLIC" ? [...profile.skillsHave, ...profile.skillsWant] : [],
          currentCourseIDs:
            profile.visibility.courses === "PUBLIC"
              ? profile.courses.filter((course) => course.status === "IN_PROGRESS").map((course) => course.courseID)
              : [],
          plannedSchedule: schedule
            ? {
                name: schedule.name,
                semester: schedule.semester as "fall" | "spring" | "summer",
                year: schedule.year,
                courses: schedule.courses.map((course) => ({
                  courseID: course.courseID,
                  lecture: course.lecture ?? null,
                  section: course.section ?? null,
                })),
              }
            : null,
          following: followed.has(profile.id),
          myReaction: SOCIAL_REACTIONS.includes(ownReaction as SocialReaction) ? (ownReaction as SocialReaction) : null,
          reactions: counts,
        };
      })
    );
  } catch (error) {
    next(error);
  }
};

export const publishSocialSchedule: RequestHandler<
  unknown,
  { ok: true } | ErrorBody,
  { token: string; schedule: unknown },
  unknown,
  UserLocals
> = async (req, res, next) => {
  const parsed = publishScheduleInputSchema.safeParse({
    schedule: req.body.schedule,
  });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid schedule" });
    return;
  }
  try {
    if (parsed.data.schedule === null) {
      await db.socialSchedules.deleteMany({
        where: { clerkUserId: res.locals.userId },
      });
    } else {
      await db.socialSchedules.upsert({
        where: { clerkUserId: res.locals.userId },
        update: parsed.data.schedule,
        create: {
          clerkUserId: res.locals.userId,
          ...parsed.data.schedule,
        },
      });
    }
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};

export const updateFollow: RequestHandler<
  unknown,
  { ok: true } | ErrorBody,
  { token: string; profileID: unknown; follow: unknown },
  unknown,
  UserLocals
> = async (req, res, next) => {
  const parsed = followInputSchema.safeParse({
    profileID: req.body.profileID,
    follow: req.body.follow,
  });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid follow" });
    return;
  }
  try {
    const target = await db.profiles.findUnique({
      where: { id: parsed.data.profileID },
    });
    if (!target || target.clerkUserId === res.locals.userId) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    if (parsed.data.follow) {
      await db.follows.upsert({
        where: {
          followerUserId_followedProfileId: {
            followerUserId: res.locals.userId,
            followedProfileId: parsed.data.profileID,
          },
        },
        update: {},
        create: {
          followerUserId: res.locals.userId,
          followedProfileId: parsed.data.profileID,
        },
      });
    } else {
      await db.follows.deleteMany({
        where: {
          followerUserId: res.locals.userId,
          followedProfileId: parsed.data.profileID,
        },
      });
    }
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};

export const updateScheduleReaction: RequestHandler<
  unknown,
  { ok: true } | ErrorBody,
  { token: string; profileID: unknown; reaction: unknown },
  unknown,
  UserLocals
> = async (req, res, next) => {
  const parsed = reactionInputSchema.safeParse({
    profileID: req.body.profileID,
    reaction: req.body.reaction,
  });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid reaction" });
    return;
  }
  try {
    if (parsed.data.reaction === null) {
      await db.scheduleReactions.deleteMany({
        where: {
          reactorUserId: res.locals.userId,
          targetProfileId: parsed.data.profileID,
        },
      });
    } else {
      await db.scheduleReactions.upsert({
        where: {
          reactorUserId_targetProfileId: {
            reactorUserId: res.locals.userId,
            targetProfileId: parsed.data.profileID,
          },
        },
        update: { reaction: parsed.data.reaction },
        create: {
          reactorUserId: res.locals.userId,
          targetProfileId: parsed.data.profileID,
          reaction: parsed.data.reaction,
        },
      });
    }
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};
