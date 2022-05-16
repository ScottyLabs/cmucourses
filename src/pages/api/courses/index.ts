import { projection, singleToArray, standardizeID } from "../../../lib/util";
import dbConnect from "../../../lib/db";
import { Course, Schedule } from "../../../models/course";

export default async function handler(req, res) {
  await dbConnect();
  const courseIDs = singleToArray(req.query.courseID).map(standardizeID);

  const options = { populate: [] };
  if ("schedulesAvailable" in req.query && req.query.schedulesAvailable) {
    options.populate.push({
      path: "schedules",
      model: Schedule,
      select: "year semester session _id",
    });
  }

  try {
    const result = await Course.find({ courseID: { $in: courseIDs } }, projection, options);
    res.json(result);
  } catch(e) {
    res.status(500).send(e);
  }
}