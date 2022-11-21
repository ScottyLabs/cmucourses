import { singleToArray, standardizeID } from "../util.js";
import { Course, Schedule } from "../models/course.js";
import { FCE } from "../models/fce.js";

const projection = { _id: false, __v: false };
const MAX_LIMIT = 10;

export const getCourseByID = (req, res) => {
  const id = standardizeID(req.params.courseID);

  const options = {};
  if ("schedules" in req.query && req.query.schedules)
    options.populate = [{ path: "schedules", model: Schedule }];

  Course.findOne({ courseID: id }, projection, options)
    .then((result) => res.json(result))
    .catch((err) => res.status(500).send(err));
};

export const getCourses = (req, res) => {
  const courseIDs = singleToArray(req.query.courseID).map(standardizeID);

  const options = { populate: [] };
  if ("schedules" in req.query && req.query.schedules) {
    options.populate.push({
      path: "schedules",
      model: Schedule,
      select: "year semester session _id",
    });
  }

  Course.find({ courseID: { $in: courseIDs } }, projection, options)
    .then((result) => res.json(result))
    .catch((err) => res.status(500).send(err));
};

export const getFilteredCourses = (req, res) => {
  const matchQuery = {};
  const options = {
    projection: { ...projection },
    limit: MAX_LIMIT,
    populate: [],
  };

  if ("department" in req.query)
    matchQuery["department"] = { $in: singleToArray(req.query.department) };

  if ("keywords" in req.query) {
    matchQuery["$text"] = { $search: req.query.keywords };
    options.projection.score = { $meta: "textScore" };
  }

  const pipeline = [];
  pipeline.push({ $match: matchQuery });

  const hasUnitsFilter =
    ("unitsMin" in req.query && parseInt(req.query.unitsMin)) ||
    ("unitsMax" in req.query && parseInt(req.query.unitsMax));

  if (hasUnitsFilter) {
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

    const unitsQuery = {};
    unitsQuery["unitsDecimal"] = {};

    if ("unitsMin" in req.query && parseInt(req.query.unitsMin)) {
      unitsQuery["unitsDecimal"].$gte = parseInt(req.query.unitsMin) || 0;
    }

    if ("unitsMax" in req.query && parseInt(req.query.unitsMax)) {
      unitsQuery["unitsDecimal"].$lte = parseInt(req.query.unitsMax) || 100;
    }

    pipeline.push({ $match: unitsQuery });
  }

  if ("keywords" in req.query) options.sort = { score: { $meta: "textScore" } };

  if ("page" in req.query) options.page = req.query.page;

  if ("schedules" in req.query && req.query.schedules)
    pipeline.push({
      $lookup: {
        from: "schedules",
        localField: "courseID",
        foreignField: "courseID",
        as: "schedules",
      },
    });

  if ("session" in req.query) {
    const sessions = singleToArray(req.query.session).flatMap(
      (serializedSession) => {
        try {
          const session = JSON.parse(serializedSession);
          return [{ year: parseInt(session.year), semester: session.semester }];
        } catch (e) {
          // SyntaxError
          return [];
        }
      }
    );
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

  if (req.method === "POST") {
    if ("fces" in req.query && req.query.fces) {
      options.populate.push({
        path: "fces",
        model: FCE,
        select: "-_id",
      });
    }
  }

  const aggregate = Course.aggregate(pipeline);
  Course.aggregatePaginate(aggregate, options)
    .then((result) => res.json(result))
    .catch((err) => res.status(500).send(err));
};

// TODO: use a better caching system
const allCoursesEntry = {
  allCourses: [],
  lastCached: null,
};

export const getAllCourses = (req, res) => {
  if (
    allCoursesEntry.lastCached === null ||
    new Date() - allCoursesEntry.lastCached > 1000 * 60 * 60 * 24
  ) {
    Course.find({}, "courseID name -_id")
      .then((result) => {
        allCoursesEntry.lastCached = new Date();
        allCoursesEntry.allCourses = result;
        res.json(result);
      })
      .catch((err) => res.status(500).send(err));
  } else {
    res.json(allCoursesEntry.allCourses);
  }
};
