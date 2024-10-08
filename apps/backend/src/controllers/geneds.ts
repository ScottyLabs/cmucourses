import { RequestHandler } from "express";
import prisma from "@cmucourses/db";
import { ElemType, PrismaReturn } from "~/util";
import db from "@cmucourses/db";

type fce = ElemType<PrismaReturn<typeof db.fces.findMany>>;

type GenedsInfo = {
  courseID?: string | undefined;
  hrsPerWeek?: number | undefined;
  instructor?: string | undefined;
  numRespondents?: number | undefined;
  possibleRespondents?: number | undefined;
  rating?: number[] | undefined;
  responseRate?: string | undefined;
  name?: string | undefined;
  units?: string | undefined;
  fces: Omit<fce, "id" | "v">[];
}[];

export interface GetGeneds {
  params: unknown;
  resBody: GenedsInfo;
  reqBody: unknown;
  query: {
    school: string;
  };
}

export const getGeneds: RequestHandler<
  GetGeneds["params"],
  GetGeneds["resBody"],
  GetGeneds["reqBody"],
  GetGeneds["query"]
> = async (req, res, next) => {
  try {
    if ("school" in req.query) {
      console.log(req.query.school);
      const school = req.query.school
      const geneds = await prisma.geneds.findMany({
        select: {
          courseID: true,
        },
        where: {
          school
        }
      });

      const courseIDs = geneds.map((gened) => gened.courseID);

      const courses = await prisma.courses.findMany({
        select: {
          courseID: true,
          name: true,
          units: true,
        },
        where: {
          courseID: {
            in: courseIDs
          }
        }
      });

      const fces = await prisma.fces.findMany({
        where: {
          courseID: {
            in: courseIDs
          }
        }
      });

      const results = [];
      for (const courseID of courseIDs) {
        const course = courses.find((course) => course.courseID === courseID);
        const fce = fces.filter((fce) => fce.courseID === courseID);
        results.push({ ...course, fces: fce });
      }

      res.json(results);
    }
  } catch (e) {
    next(e);
  }
};
