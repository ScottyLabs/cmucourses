import { Empty, singleToArray, standardizeID } from "../util.mjs";
import { RequestHandler } from "express";
import prisma from "../models/prisma.mjs";
import { Prisma } from "@prisma/client";

const select: Required<Prisma.fcesSelect> = {
  id: false,
  v: false,
  andrewID: true,
  college: true,
  courseID: true,
  courseName: true,
  department: true,
  hrsPerWeek: true,
  instructor: true,
  level: true,
  location: true,
  numRespondents: true,
  possibleRespondents: true,
  rating: true,
  responseRate: true,
  semester: true,
  year: true
};

export type GetFCEsQuery = { courseID: string | string[] } | { instructor: string };

export type GetFCEsResBody = Awaited<ReturnType<typeof prisma.fces.findMany>>;

export const getFCEs: RequestHandler<Empty, GetFCEsResBody, Empty, GetFCEsQuery> = async (req, res, next) => {
  if ("courseID" in req.query) {
    const courseIDs = singleToArray(req.query.courseID).map(standardizeID);

    try {
      const results = await prisma.fces.findMany({
        where: {
          courseID: { in: courseIDs }
        },
        select
      });
      res.json(results);
    } catch (e) {
      next(e);
    }
  } else {
    const instructor = req.query.instructor;
    try {
      const results = await prisma.fces.findMany({
        where: {
          instructor
        },
        select
      });
      res.json(results);
    } catch (e) {
      next(e);
    }
  }
};
