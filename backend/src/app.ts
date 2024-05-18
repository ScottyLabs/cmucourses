import "dotenv/config";
import morgan from "morgan";
import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import { isUser } from "./controllers/user.mjs";
import { getAllCourses, getCourseByID, getCourses, getFilteredCourses } from "./controllers/courses.mjs";
import { getFCEs } from "./controllers/fces.mjs";
import { getInstructors } from "./controllers/instructors.mjs";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

app.route("/course/:courseID").get(getCourseByID);
app.route("/courses").get(getCourses);
app.route("/courses").post(isUser, getCourses);
app.route("/courses/all").get(getAllCourses);
app.route("/courses/search/").get(getFilteredCourses);
app.route("/courses/search/").post(isUser, getFilteredCourses);

app.route("/fces").post(isUser, getFCEs);

app.route("/instructors").get(getInstructors);

// the next parameter is needed!
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json(err);
};

app.use(errorHandler);

app.listen(port, () => console.log(`Course Tool backend listening on port ${port}.`));
