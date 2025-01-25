import { ElemType, exclude, PrismaReturn, singleToArray, standardizeID } from "~/util";
import { RequestHandler } from "express";
import db from "@cmucourses/db";

type schedule = ElemType<PrismaReturn<typeof db.schedules.findMany>>;

export interface GetSchedules {
  params: unknown;
  resBody: Omit<schedule, "id" | "v">[];
  reqBody: unknown;
  query: { courseID: string | string[] } | { instructor: string | string[] };
}

export const getSchedules: RequestHandler<
  GetSchedules["params"],
  GetSchedules["resBody"],
  GetSchedules["reqBody"],
  GetSchedules["query"]
> = async (req, res, next) => {
  if ("instructor" in req.query) {
    const instructors = singleToArray(req.query.instructor);
    try {
      const schedules = await db.schedules.findMany({
        where: {
          instructors: { hasSome: instructors },
        },
      });
      const projectedResults = schedules.map((courseFce) => exclude(courseFce, "id", "v"));
      res.json(projectedResults);
    } catch (e) {
      next(e);
    }
  } else if ("courseID" in req.query) {
    const courseIDs = singleToArray(req.query.courseID).map(standardizeID);
    try {
      const schedules = await db.schedules.findMany({
        where: {
          courseID: { in: courseIDs },
        },
      });
      const projectedResults = schedules.map((courseFce) => exclude(courseFce, "id", "v"));
      res.json(projectedResults);
    } catch (e) {
      next(e);
    }
  }
};
