import { RequestHandler } from "express";
import { PrismaReturn } from "../util.mjs";
import prisma from "../models/prisma.mjs";

const getAllProfessorsDbQuery = {
  select: {
    name: true,
  },
};

export interface GetProfessors {
  params: unknown;
  resBody: PrismaReturn<typeof prisma.professors.findMany<typeof getAllProfessorsDbQuery>>;
  reqBody: unknown;
  query: unknown;
}

export const getProfessors: RequestHandler<
  GetProfessors["params"],
  GetProfessors["resBody"],
  GetProfessors["reqBody"],
  GetProfessors["query"]
> = async (req, res, next) => {
  try {
    const professors = await prisma.professors.findMany(getAllProfessorsDbQuery);
    professors.sort((a, b) => a.name.localeCompare(b.name));
    res.json(professors);
  } catch (e) {
    next(e);
  }
};
