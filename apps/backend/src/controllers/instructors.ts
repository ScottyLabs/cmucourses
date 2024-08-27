import { RequestHandler } from "express";
import { PrismaReturn } from "~/util";
import prisma from "@cmucourses/db";

const getAllInstructorsDbQuery = {
  select: {
    instructor: true,
  },
};

export interface GetInstructors {
  params: unknown;
  resBody: PrismaReturn<typeof prisma.fces.findMany<typeof getAllInstructorsDbQuery>>;
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
    const instructors = await prisma.fces.findMany({
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
