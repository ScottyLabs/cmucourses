import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { KeyStore, generateSigningRequestHandler } from "passlink-server";
import { isUser } from "./controllers/user.js";
import {
  getCourseByID,
  getCourses,
  getAllCourses,
  getFilteredCourses,
} from "./controllers/courses.ts";
import { getFCEs } from "./controllers/fces.js";

KeyStore.readKey(process.env.LOGIN_API_KEY);

const app = express();
const signingRequestHandler = generateSigningRequestHandler(
  {
    restrictDomain: true,
    applicationId: process.env.LOGIN_API_ID,
  },
  KeyStore.getSecretKey(),
  true
);

const port = process.env.PORT || 3000;
const database = process.env.MONGODB_URI || "mongodb://localhost:27017";

mongoose.Promise = global.Promise;
mongoose.connect(database, {
  dbName: "course-api",
});

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/signingrequest", (req, res) => {
  signingRequestHandler(req, res);
});

app.route("/course/:courseID").get(getCourseByID);
app.route("/courses").get(getCourses);
app.route("/courses").post(isUser, getCourses);
app.route("/courses/all").get(getAllCourses);
app.route("/courses/search/").get(getFilteredCourses);
app.route("/courses/search/").post(isUser, getFilteredCourses);

app.route("/fces").post(isUser, getFCEs);

app.listen(port, () =>
  console.log(`Course Tool backend listening on port ${port}.`)
);
