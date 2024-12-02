import { ElemType, exclude, PrismaReturn, singleToArray, standardizeID } from "~/util";
import { RequestHandler } from "express";
import db from "@cmucourses/db";

type fce = ElemType<PrismaReturn<typeof db.fces.findMany>>;

export interface GetFces {
  params: unknown;
  resBody: Omit<fce, "id" | "v">[];
  reqBody: unknown;
  query: { courseID: string | string[] } | { instructor: string | string[] };
}

export const getFCEs: RequestHandler<
  GetFces["params"],
  GetFces["resBody"],
  GetFces["reqBody"],
  GetFces["query"]
> = async (req, res, next) => {
  if ("courseID" in req.query) {
    const courseIDs = singleToArray(req.query.courseID).map(standardizeID);
    try {
      const results = await db.fces.findMany({
        where: {
          courseID: { in: courseIDs },
        },
      });

      const projectedResults = results.map((courseFce) => exclude(courseFce, "id", "v"));

      res.json(projectedResults);
    } catch (e) {
      next(e);
    }
  } else {
    const instructors = singleToArray(req.query.instructor);
    try {
      const results = await db.fces.findMany({
        where: {
          instructor: { in: instructors },
        },
      });

      const projectedResults = results.map((courseFce) => exclude(courseFce, "id", "v"));

      res.json(projectedResults);
    } catch (e) {
      next(e);
    }
  }
};
