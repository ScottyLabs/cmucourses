import { RequestHandler } from "express";
import { PrismaReturn } from "~/util";
import db from "@cmucourses/db";

type GetAllInstructorsDbQuery = {
  select: {
    instructor: true;
  };
};

export interface GetInstructors {
  params: unknown;
  resBody: PrismaReturn<typeof db.fces.findMany<GetAllInstructorsDbQuery>>;
  reqBody: unknown;
  query: unknown;
}

export const getInstructors: RequestHandler<
  GetInstructors["params"],
  GetInstructors["resBody"],
  GetInstructors["reqBody"],
  GetInstructors["query"]
> = async (_, res, next) => {
  try {
    const instructors = await db.fces.findMany({
      select: {
        instructor: true,
      },
      orderBy: {
        instructor: "asc",
      },
      distinct: ["instructor"],
    });
    res.json(instructors);
  } catch (e) {
    next(e);
  }
};
