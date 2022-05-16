import { projection, standardizeID } from "../../../lib/util";
import { Course, Schedule } from "../../../models/course";
import dbConnect from "../../../lib/db";

export default async function handler(req, res) {
  await dbConnect();

  const id = standardizeID(req.query.courseID);

  const options: any = {};
  if ("schedules" in req.query && req.query.schedules)
    options.populate = [{ path: "schedules", model: Schedule }];

  try {
    const result = await Course.findOne({ courseID: id }, projection, options);
    res.json(result);
  } catch(e) {
    res.status(500).send(e);
  }
}