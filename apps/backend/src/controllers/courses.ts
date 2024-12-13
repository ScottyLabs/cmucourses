import {
  BoolLiteral,
  fromBoolLiteral,
  parseOptionalInt,
  PrismaReturn,
  SingleOrArray,
  singleToArray,
  standardizeID,
  parsePrereqString,
} from "~/util";
import { RequestHandler } from "express";
import db, { Prisma } from "@cmucourses/db";

const projection = { _id: false, __v: false };
const MAX_LIMIT = 10;

export interface GetCourseById {
  params: {
    courseID: string;
  };
  query: {
    schedules?: BoolLiteral;
  };
  resBody: PrismaReturn<typeof db.courses.findFirstOrThrow>;
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
    const course = await db.courses.findFirstOrThrow({
      where: {
        courseID: id,
      },
      include: {
        schedules: fromBoolLiteral(req.query.schedules),
      },
    });

    res.json(course);
  } catch (e) {
    next(e);
  }
};

export interface GetCourses {
  params: unknown;
  resBody: PrismaReturn<typeof db.courses.findMany>;
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
    const courses = await db.courses.findMany({
      where: {
        courseID: { in: courseIDs },
      },
      include: {
        schedules: fromBoolLiteral(req.query.schedules),
      },
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

export interface GetFilteredCoursesResult {
  metadata: { totalDocs: number }[];
  data: unknown[];
}

export const getFilteredCourses: RequestHandler<
  GetFilteredCourses["params"],
  GetFilteredCourses["resBody"],
  GetFilteredCourses["reqBody"],
  GetFilteredCourses["query"]
> = async (req, res, next) => {
  // raw query, because prisma doesn't support full-text search for mongodb yet

  const pipeline: Prisma.InputJsonValue[] = [];

  const matchStage: Record<string, unknown> = {};
  const sortKeys: [string, unknown][] = [];
  const addedFields: Record<string, unknown> = {};

  if (req.query.keywords !== undefined) {
    matchStage.$text = { $search: req.query.keywords };
    sortKeys.push(["score", { $meta: "textScore" }]);
    addedFields.relevance = { $meta: "textScore" };
  }

  if (req.query.department !== undefined) {
    matchStage.department = { $in: singleToArray(req.query.department) };
  }

  if (req.query.levels !== undefined && req.query.levels.length > 0) {
    const levelRange = req.query.levels;
    matchStage.courseID = { $regex: `\\d\\d-[${levelRange}]\\d\\d` };
  }

  pipeline.push({ $match: matchStage } as Prisma.InputJsonValue);

  const unitsMin = req.query.unitsMin === undefined ? undefined : parseInt(req.query.unitsMin);
  const unitsMax = req.query.unitsMax === undefined ? undefined : parseInt(req.query.unitsMax);

  if (unitsMin !== undefined || unitsMax !== undefined) {
    pipeline.push({
      $addFields: {
        unitsDecimal: {
          $convert: {
            input: "$units",
            to: "decimal",
            onError: null,
            onNull: null,
          },
        },
      },
    });

    pipeline.push({
      $match: {
        unitsDecimal: {
          $gte: unitsMin,
          $lte: unitsMax,
        },
      },
    });
  }

  if (fromBoolLiteral(req.query.schedules))
    pipeline.push({
      $lookup: {
        from: "schedules",
        localField: "courseID",
        foreignField: "courseID",
        as: "schedules",
      },
    });

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
            $or: sessions,
          },
        },
      },
    });
  }

  pipeline.push({ $addFields: addedFields as Prisma.InputJsonValue });
  pipeline.push({ $project: projection as Prisma.InputJsonValue });

  if (sortKeys.length > 0) {
    const sortOptions: Record<string, unknown> = {};
    for (const [key, option] of sortKeys) {
      sortOptions[key] = option;
    }

    pipeline.push({ $sort: sortOptions as Prisma.InputJsonValue });
  }

  const page = parseOptionalInt(req.query.page, 1);
  const pageSize = Math.min(parseOptionalInt(req.query.pageSize, MAX_LIMIT), MAX_LIMIT);

  pipeline.push({
    $facet: {
      metadata: [{ $count: "totalDocs" }],
      data: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }],
    },
  });

  try {
    const result = (await db.courses.aggregateRaw({ pipeline }))[0] as unknown as GetFilteredCoursesResult;
    const totalDocs = result.metadata[0]?.totalDocs ?? 0;

    res.json({
      totalDocs,
      totalPages: Math.ceil(totalDocs / pageSize),
      page,
      docs: result.data,
    });
  } catch (e) {
    next(e);
  }
};

// TODO: use a better caching system

const allCoursesEntry = {
  allCourses: [] as GetAllCourses["resBody"],
  lastCached: new Date(1970),
};

const getAllCoursesDbQuery = {
  select: {
    courseID: true,
    name: true,
    id: true,
  },
};

export interface GetAllCourses {
  params: unknown;
  resBody: PrismaReturn<typeof db.courses.findMany<typeof getAllCoursesDbQuery>>;
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
      const courses = await db.courses.findMany(getAllCoursesDbQuery);

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


export const getRequisites: RequestHandler = async (req, res, next) => {
  try {
    if (!req.params.courseID) {
      return res.status(400).json({ error: 'courseID parameter is required' });
    }

    const courseID = standardizeID(req.params.courseID);

    const course = await db.courses.findUnique({
      where: { courseID },
      select: {
        courseID: true,
        prereqs: true,
        prereqString: true,
      },
    });

    if (!course) {
      return res.status(400).json({ error: 'Course not found' });
    }

    const parsedPrereqs = parsePrereqString(course.prereqString);

    const postreqs = await db.courses.findMany({
      where: {
        prereqs: {
          has: course.courseID,
        },
      },
      select: {
        courseID: true,
      },
    });

    const postreqIDs = postreqs.map(postreq => postreq.courseID);

    const courseRequisites = {
      prereqs: course.prereqs,
      prereqRelations: parsedPrereqs,
      postreqs: postreqIDs
    }

    res.json(courseRequisites);
  } catch (e) {
    next(e);
  }
};
