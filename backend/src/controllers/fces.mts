import { ElemType, exclude, PrismaReturn, singleToArray, standardizeID } from "../util.mjs";
import { RequestHandler } from "express";
import prisma from "../models/prisma.mjs";

type fce = ElemType<PrismaReturn<typeof prisma.fces.findMany>>;

export interface GetFces {
  params: unknown;
  resBody: Omit<fce, "id" | "v">[];
  reqBody: unknown;
  query: { courseID: string | string[] } | { instructor: string };
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
      const results = await prisma.fces.findMany({
        where: {
          courseID: { in: courseIDs }
        }
      });

      const projectedResults =
        results.map((courseFce) => exclude(courseFce, "id", "v"));

      res.json(projectedResults);
    } catch (e) {
      next(e);
    }
  } else {
    const instructor = req.query.instructor;
    try {
      const results = await prisma.fces.findMany({
        where: {
          instructor
        }
      });

      const projectedResults =
        results.map((courseFce) => exclude(courseFce, "id", "v"));

      res.json(projectedResults);
    } catch (e) {
      next(e);
    }
  }
};
