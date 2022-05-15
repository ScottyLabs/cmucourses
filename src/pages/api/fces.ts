import { isUser } from "../../lib/auth";
import { projection, singleToArray, standardizeID } from "../../lib/util";
import { FCE } from "../../models/fce";
import dbConnect from "../../lib/db";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST" || !(await isUser(req, res))) {
    return;
  }

  const courseIDs = singleToArray(req.query.courseID).map(standardizeID);

  try {
    const result = await FCE.find(
      { courseID: { $in: courseIDs } },
      projection);
    res.json(result);
  } catch(e) {
    res.status(500).send(e);
  }
}