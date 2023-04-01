import { BoolLiteral, fromBoolLiteral, PrismaReturn, SingleOrArray, singleToArray, standardizeID } from "../util.mjs";
import { Course } from "../models/course.js";
import { FCE } from "../models/fce.js";
import { RequestHandler } from "express";
import prisma from "../models/prisma.mjs";
import { AggregateOptions, AnyObject, PipelineStage } from "mongoose";

const projection = { _id: false, __v: false };
const MAX_LIMIT = 10;

export interface GetCourseById {
  params: {
    courseID: string;
  };
  query: {
    schedules?: BoolLiteral;
  };
  resBody: PrismaReturn<typeof prisma.courses.findFirstOrThrow>;
  reqBody: unknown;
}

export const getCourseByID: RequestHandler<
  GetCourseById["params"],
  GetCourseById["resBody"],
  GetCourseById["reqBody"],
  GetCourseById["query"]
> = async (req, res, next) => {
  const id = standardizeID(req.params.courseID);
  try {
    const course = await prisma.courses.findFirstOrThrow({
      where: {
        courseID: id
      },
      include: {
        schedules: fromBoolLiteral(req.query.schedules)
      }
    });

    res.json(course);
  } catch (e) {
    next(e);
  }
};

export interface GetCourses {
  params: unknown;
  resBody: PrismaReturn<typeof prisma.courses.findMany>;
  reqBody: unknown;
  query: {
    courseID: SingleOrArray<string>;
    schedules: BoolLiteral;
  };
}

export const getCourses: RequestHandler<
  GetCourses["params"],
  GetCourses["resBody"],
  GetCourses["reqBody"],
  GetCourses["query"]
> = async (req, res, next) => {
  const courseIDs = singleToArray(req.query.courseID).map(standardizeID);

  try {
    const courses = await prisma.courses.findMany({
      where: {
        courseID: { in: courseIDs }
      },
      include: {
        schedules: fromBoolLiteral(req.query.schedules) && {
          select: {
            id: true,
            year: true,
            semester: true,
            session: true
          }
        }
      }
    });
    res.json(courses);
  } catch (e) {
    next(e);
  }
};

export interface GetFilteredCourses {
  params: unknown;
  resBody: unknown; // TODO
  reqBody: unknown;
  query: {
    department?: SingleOrArray<string>;
    keywords?: string;
    unitsMin?: string;
    unitsMax?: string;
    page?: string;
    schedules?: BoolLiteral;
    levels?: string;
    session?: SingleOrArray<string>;
    fces?: BoolLiteral;
  };
}

export const getFilteredCourses: RequestHandler<
  GetFilteredCourses["params"],
  GetFilteredCourses["resBody"],
  GetFilteredCourses["reqBody"],
  GetFilteredCourses["query"]
> = (req, res, next) => {
  const matchQuery: AnyObject = {};
  const options: AggregateOptions = {
    projection: { ...projection },
    limit: MAX_LIMIT,
    populate: []
  };

  if (req.query.department !== undefined) {
    matchQuery["department"] = { $in: singleToArray(req.query.department) };
  }

  if (req.query.keywords !== undefined) {
    matchQuery["$text"] = { $search: req.query.keywords };
    options.projection.score = { $meta: "textScore" };
    options.sort = { score: { $meta: "textScore" } };
  }

  const pipeline: PipelineStage[] = [];
  pipeline.push({ $match: matchQuery });

  const hasUnitsFilter =
    (req.query.unitsMin !== undefined && parseInt(req.query.unitsMin)) ||
    (req.query.unitsMax !== undefined && parseInt(req.query.unitsMax));

  if (hasUnitsFilter) {
    pipeline.push({
      $addFields: {
        unitsDecimal: {
          $convert: {
            input: "$units",
            to: "decimal",
            onError: null,
            onNull: null
          }
        }
      }
    });

    const unitsQuery: AnyObject = {};
    unitsQuery["unitsDecimal"] = {};

    if (req.query.unitsMin !== undefined) {
      unitsQuery["unitsDecimal"].$gte = parseInt(req.query.unitsMin) || 0;
    }

    if (req.query.unitsMax !== undefined) {
      unitsQuery["unitsDecimal"].$lte = parseInt(req.query.unitsMax) || 100;
    }

    pipeline.push({ $match: unitsQuery });
  }

  if (req.query.page !== undefined) options.page = req.query.page;

  if (fromBoolLiteral(req.query.schedules))
    pipeline.push({
      $lookup: {
        from: "schedules",
        localField: "courseID",
        foreignField: "courseID",
        as: "schedules"
      }
    });

  if (req.query.levels !== undefined && req.query.levels.length > 0) {
    const levelRange = req.query.levels;
    pipeline.push({
      $match: {
        courseID: { $regex: `\\d\\d-[${levelRange}]\\d\\d` }
      }
    });
  }

  if (req.query.session !== undefined) {
    const sessions = singleToArray(req.query.session).flatMap((serializedSession) => {
      try {
        const session = JSON.parse(serializedSession);
        return [{ year: parseInt(session.year), semester: session.semester }];
      } catch (e) {
        // SyntaxError
        return [];
      }
    });
    pipeline.push({
      $match: {
        schedules: {
          $elemMatch: {
            $or: sessions
          }
        }
      }
    });
  }

  if (req.method === "POST") {
    if (fromBoolLiteral(req.query.fces)) {
      options.populate.push({
        path: "fces",
        model: FCE,
        select: "-_id"
      });
    }
  }

  Course.aggregate(pipeline)
    .option(options)
    .then((result) => res.json(result), next);
};

// TODO: use a better caching system

const allCoursesEntry = {
  allCourses: [] as GetAllCourses["resBody"],
  lastCached: new Date(1970)
};

const getAllCoursesDbQuery = {
  select: {
    courseID: true,
    name: true,
    id: true
  }
};

export interface GetAllCourses {
  params: unknown;
  resBody: PrismaReturn<typeof prisma.courses.findMany<typeof getAllCoursesDbQuery>>;
  reqBody: unknown;
  query: unknown;
}

export const getAllCourses: RequestHandler<
  GetAllCourses["params"],
  GetAllCourses["resBody"],
  GetAllCourses["reqBody"],
  GetAllCourses["query"]
> = async (req, res, next) => {
  if (new Date().valueOf() - allCoursesEntry.lastCached.valueOf() > 1000 * 60 * 60 * 24) {
    try {
      const courses = await prisma.courses.findMany(getAllCoursesDbQuery);

      allCoursesEntry.lastCached = new Date();
      allCoursesEntry.allCourses = courses;

      res.json(courses);
    } catch (e) {
      next(e);
    }
  } else {
    res.json(allCoursesEntry.allCourses);
  }
};
