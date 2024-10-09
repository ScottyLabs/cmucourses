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
  desc?: string | undefined;
  tags?: string[] | undefined;
  fces: Omit<fce, "id" | "v">[];
}[];

export interface GetGeneds {
  params: unknown;
  resBody: GenedsInfo;
  reqBody: {
    token: string;
  };
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
      const school = req.query.school
      const geneds = await prisma.geneds.findMany({
        select: {
          courseID: true,
          tags: true,
        },
        where: {
          school
        }
      });

      const proccesedGeneds = Object.fromEntries(
        geneds.map((gened) => [gened.courseID, gened])
      );
      const courseIDs = Object.keys(proccesedGeneds);


      const courses = await prisma.courses.findMany({
        select: {
          courseID: true,
          name: true,
          units: true,
          desc: true,
        },
        where: {
          courseID: {
            in: courseIDs
          }
        }
      });

      const processedCourses = Object.fromEntries(
        courses.map((course) => [course.courseID, course])
      );

      let fces;
      if (req.body.token) {
        fces = await prisma.fces.findMany({
          where: {
            courseID: {
              in: courseIDs
            }
          }
        });
      }

      const results = [];
      for (const courseID of courseIDs) {
        const course = processedCourses[courseID];
        const fce = fces ? fces.filter((fce) => fce.courseID === courseID) : [];
        const tags = proccesedGeneds[courseID]?.tags;
        results.push({ ...course, tags, fces: fce, courseID });
      }

      res.json(results);
    }
  } catch (e) {
    next(e);
  }
};
