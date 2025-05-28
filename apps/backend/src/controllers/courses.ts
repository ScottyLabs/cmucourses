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
import { SortOption, type Sort } from "~/../../apps/frontend/src/app/sorts";
import { initialState } from "~/../../apps/frontend/src/app/user";

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
    sort?: SingleOrArray<string>;
    numSemesters?: string;
    spring?: BoolLiteral;
    summer?: BoolLiteral;
    fall?: BoolLiteral;
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
  const addedFields: Record<string, unknown> = {};

  if (req.query.keywords !== undefined) {
    matchStage.$text = { $search: req.query.keywords };
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
        unitRangeMin: {
          $cond: {
            if: { $or: [{ $eq: ["$units", ""] }, { $eq: ["$units", "VAR"] }] },
            then: 0,
            else: {
              $toDouble: {
                $trim: {
                  input: {
                    // Some courses have units listed as 0-48 for example
                    // We don't want to complicate the pipeline, so just take the lower bound
                    $arrayElemAt: [{ $split: [{ $arrayElemAt: [{ $split: ["$units", "-"] }, 0] }, ","] }, 0],
                  },
                },
              },
            },
          },
        },
        unitRangeMax: {
          $cond: {
            if: { $or: [{ $eq: ["$units", ""] }, { $eq: ["$units", "VAR"] }] },
            then: 50, // Default max units if not specified
            else: {
              $toDouble: {
                $trim: {
                  input: {
                    // Some courses have units listed as 0-48 for example
                    // We don't want to complicate the pipeline, so just take the lower bound
                    $arrayElemAt: [{ $split: [{ $arrayElemAt: [{ $split: ["$units", "-"] }, -1] }, ","] }, -1],
                  },
                },
              },
            },
          },
        },
      },
    });

    pipeline.push({
      $match: {
        unitRangeMax: {
          $gte: unitsMin,
        },
        unitRangeMin: {
          $lte: unitsMax,
        }
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
      } catch {
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
  // Sort by best relevance, with lowest priority vs other sorts
  pipeline.push({
    $sort: {
      relevance: -1, 
    }
  });
  if (req.query.sort !== undefined) {
    // const numSemesters = parseOptionalInt(req.query.numSemesters, initialState.fceAggregation.numSemesters);
    const spring = !req.query.spring ? initialState.fceAggregation.counted.spring : fromBoolLiteral(req.query.spring);
    const summer = !req.query.summer ? initialState.fceAggregation.counted.summer : fromBoolLiteral(req.query.summer);
    const fall = !req.query.fall ? initialState.fceAggregation.counted.fall : fromBoolLiteral(req.query.fall);

    // Add a $lookup stage to join the fces collection
    pipeline.push({
      $lookup: {
        from: "fces",
        localField: "courseID",
        foreignField: "courseID",
        as: "fces",
      },
    });

    // Unwind the fces array to de-normalize the data
    pipeline.push({
      $unwind: {
        path: "$fces",
        preserveNullAndEmptyArrays: true,
      },
    });

    // Filter FCEs based on the counted settings
    pipeline.push({
      $match: {
        $expr: {
          $or: [
            { $and: [{ $eq: ["$fces.semester", "spring"] }, { $eq: [spring, true] }] },
            { $and: [{ $eq: ["$fces.semester", "summer"] }, { $eq: [summer, true] }] },
            { $and: [{ $eq: ["$fces.semester", "fall"] }, { $eq: [fall, true] }] },
          ],
        },
      },
    });

    // TODO: These take a long time to run and then return a 304 with no results
    // So only the seasons from fceAggregation.counted are respected for now

    // Sort FCEs by year and semester to find the latest ones
    // pipeline.push({
    //   $addFields: {
    //     numericYear: { $toInt: "$fces.year" },
    //     numericSemester: {
    //       $switch: {
    //         branches: [
    //           { case: { $eq: ["$fces.semester", "fall"] }, then: 3 },
    //           { case: { $eq: ["$fces.semester", "summer"] }, then: 2 },
    //           { case: { $eq: ["$fces.semester", "spring"] }, then: 1 },
    //         ],
    //         default: 0,
    //       },
    //     },
    //   },
    // });

    // pipeline.push({
    //   $sort: {
    //     numericYear: SortType.Descending,
    //     numericSemester: SortType.Descending,
    //   },
    // });

    // Limit the number of FCEs to the specified numSemesters
    // pipeline.push({
    //   $group: {
    //     _id: "$courseID",
    //     fces: { $push: "$fces" },
    //   },
    // });

    // pipeline.push({
    //   $project: {
    //     fces: { $slice: ["$fces", numSemesters] },
    //   },
    // });

    // Group by courseID to calculate aggregated values
    pipeline.push({
      $group: {
        _id: "$courseID",
        doc: { $first: "$$ROOT" },
        avgTeachingRate: { $avg: { $arrayElemAt: ["$fces.rating", 7] } },
        avgCourseRate: { $avg: { $arrayElemAt: ["$fces.rating", 8] } },
      },
    });

    // Add the aggregated fields back to the root document
    pipeline.push({
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$doc", { avgTeachingRate: "$avgTeachingRate", avgCourseRate: "$avgCourseRate" }],
        },
      },
    });

    const sorts = singleToArray(req.query.sort)
      .reverse()
      .map((sort) => JSON.parse(sort) as Sort);

    sorts.forEach((sort) => {
      switch (sort.option) {
        case SortOption.FCE:
          pipeline.push({
            $addFields: {
              fce: {
                $avg: "$fces.hrsPerWeek",
              },
            },
          });
          pipeline.push({
            $sort: {
              fce: sort.type,
            },
          });
          break;
        case SortOption.TeachingRate:
          pipeline.push({
            $sort: {
              avgTeachingRate: sort.type,
            },
          });
          break;
        case SortOption.CourseRate:
          pipeline.push({
            $sort: {
              avgCourseRate: sort.type,
            },
          });
          break;
        case SortOption.Units:
          pipeline.push({
            $addFields: {
              numericUnits: {
                $cond: {
                  if: { $or: [{ $eq: ["$units", ""] }, { $eq: ["$units", "VAR"] }] },
                  then: 0,
                  else: {
                    $toDouble: {
                      $trim: {
                        input: {
                          // Some courses have units listed as 0-48 for example
                          // We don't want to complicate the pipeline, so just take the lower bound
                          $arrayElemAt: [{ $split: [{ $arrayElemAt: [{ $split: ["$units", "-"] }, 0] }, ","] }, 0],
                        },
                      },
                    },
                  },
                },
              },
            },
          });
          pipeline.push({
            $sort: {
              numericUnits: sort.type,
            },
          });
          break;
        case SortOption.CourseNumber:
          pipeline.push({
            $addFields: {
              numericCourseID: {
                $toInt: { $arrayElemAt: [{ $split: ["$courseID", "-"] }, 1] },
              },
            },
          });
          pipeline.push({
            $sort: {
              numericCourseID: sort.type,
            },
          });
          break;
      }
    });
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
      return res.status(400).json({ error: "courseID parameter is required" });
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
      return res.status(400).json({ error: "Course not found" });
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

    const postreqIDs = postreqs.map((postreq) => postreq.courseID);

    const courseRequisites = {
      prereqs: course.prereqs,
      prereqRelations: parsedPrereqs,
      postreqs: postreqIDs,
    };

    res.json(courseRequisites);
  } catch (e) {
    next(e);
  }
};
