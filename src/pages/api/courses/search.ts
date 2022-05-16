import dbConnect from "../../../lib/db";
import { MAX_LIMIT, projection, singleToArray } from "../../../lib/util";
import { FCE } from "../../../models/fce";
import { Course, Schedule } from "../../../models/course";
import { isUser } from "../../../lib/auth";

export default async function handler(req, res) {
  await dbConnect();

  const matchQuery = {};
  const options: any = {
    projection: {...projection},
    limit: MAX_LIMIT,
    populate: [],
  };

  if ("department" in req.query)
    matchQuery["department"] = { $in: singleToArray(req.query.department) };

  if ("keywords" in req.query) {
    matchQuery["$text"] = { $search: req.query.keywords };
    options.projection.score = { $meta: "textScore" };
  }

  if ("keywords" in req.query) options.sort = { score: { $meta: "textScore" } };

  if ("page" in req.query) options.page = req.query.page;

  if ("schedules" in req.query && req.query.schedules)
    options.populate.push({
      path: "schedules",
      model: Schedule,
      select: "-_id",
    });

  if ("schedulesAvailable" in req.query && req.query.schedulesAvailable)
    options.populate.push({
      path: "schedules",
      model: Schedule,
      select: "year semester session -_id",
    });

  if (req.method === "POST" && await isUser(req, res)) {
    if ("fces" in req.query && req.query.fces) {
      options.populate.push({
        path: "fces",
        model: FCE,
        select: "-_id",
      });
    }
  }

  try {
    //@ts-ignore
    const result = await Course.paginate(matchQuery, options);
    res.json(result);
  } catch(e) {
    res.status(500).send(e);
  }
}