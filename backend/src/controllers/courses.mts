import {
  BoolLiteral,
  fromBoolLiteral,
  parseOptionalInt,
  PrismaReturn,
  SingleOrArray,
  singleToArray,
  standardizeID
} from "../util.mjs";
import { RequestHandler } from "express";
import prisma from "../models/prisma.mjs";
import { Prisma } from "@prisma/client";

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
  resBody: unknown;
  reqBody: unknown;
  query: {
    page?: string;
    pageSize?: string;
    department?: SingleOrArray<string>;
    keywords?: string;
    unitsMin?: string;
    unitsMax?: string;
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
> = async (req, res, next) => {
  // raw query, because prisma doesn't support full-text search for mongodb yet

  const queryFilter: Record<string, unknown> = {};
  const options = {
    projection: { ...projection } as unknown,
    limit: MAX_LIMIT,
    populate: [],
    sort: {},
    page: undefined as string | undefined
  };

  if (req.query.department !== undefined) {
    queryFilter["department"] = { $in: singleToArray(req.query.department) };
  }

  if (req.query.keywords !== undefined) {
    queryFilter["$text"] = { $search: req.query.keywords };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options.projection.score = { $meta: "textScore" };
    options.sort = { score: { $meta: "textScore" } };
  }

  const pipeline: Prisma.InputJsonValue[] = [];
  pipeline.push({ $match: queryFilter } as Prisma.InputJsonValue);

  const unitsMin =
    req.query.unitsMin === undefined ? undefined : parseInt(req.query.unitsMin);
  const unitsMax =
    req.query.unitsMax === undefined ? undefined : parseInt(req.query.unitsMax);

  if (unitsMin !== undefined || unitsMax !== undefined) {
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

    pipeline.push({
      $match: {
        unitsDecimal: {
          $gte: unitsMin,
          $lte: unitsMax
        }
      }
    });
  }

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

  try {
    const aggregateOptions = options as Prisma.InputJsonValue;

    const page = parseOptionalInt(req.query.page, 1);
    const pageSize = parseOptionalInt(req.query.pageSize, MAX_LIMIT);

    const countResults = await prisma.courses.aggregateRaw({
      pipeline: [...pipeline, { $count: "count" }],
      options: aggregateOptions
    }) as { [0]: { count: number } };
    const totalDocs = countResults[0].count;
    const totalPages = Math.ceil(totalDocs / pageSize);

    pipeline.push({
      $skip: (page - 1) * pageSize
    }, {
      $limit: pageSize
    });

    if (req.method === "POST") {
      if (fromBoolLiteral(req.query.fces)) {
        pipeline.push({
          $lookup: {
            from: "fces",
            localField: "courseID",
            foreignField: "courseID",
            as: "fces"
          }
        });
      }
    }

    const docs = await prisma.courses.aggregateRaw({
      pipeline,
      options: aggregateOptions
    });

    res.json({
      totalDocs,
      totalPages,
      page,
      docs
    });
  } catch (e) {
    next(e);
  }
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
