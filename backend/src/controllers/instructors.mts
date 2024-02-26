import { RequestHandler } from "express";
import { PrismaReturn } from "../util.mjs";
import prisma from "../models/prisma.mjs";

const getAllInstructorsDbQuery = {
  select: {
    name: true,
  },
};

export interface GetInstructors {
  params: unknown;
  resBody: PrismaReturn<typeof prisma.professors.findMany<typeof getAllInstructorsDbQuery>>;
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
    const instructors = await prisma.professors.findMany(getAllInstructorsDbQuery);
    instructors.sort((a, b) => a.name.localeCompare(b.name));
    res.json(instructors);
  } catch (e) {
    next(e);
  }
};
