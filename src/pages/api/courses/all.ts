import dbConnect from "../../../lib/db";
import { Course } from "../../../models/course";
import cache from "memory-cache";

export default async function(req, res) {
  await dbConnect();

  try {
    const result = cache.get("all-courses");
    if (result)
      res.json(result);
    else {
      const allCourses = await Course.find({}, "courseID name -_id");
      cache.put("all-courses", allCourses, 1000 * 60 * 24);
      res.json(allCourses);
    }
  } catch(e) {
    res.status(500).send(e);
  }
}