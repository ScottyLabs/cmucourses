import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import { generateSigningRequestHandler, KeyStore } from "passlink-server";
import { isUser } from "./controllers/user.mjs";
import { getAllCourses, getCourseByID, getCourses, getFilteredCourses } from "./controllers/courses.mjs";
import { getFCEs } from "./controllers/fces.mjs";

// because there is a bug in the typing for passlink
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
KeyStore.readKey(process.env.LOGIN_API_KEY);

const app = express();
const signingRequestHandler = generateSigningRequestHandler(
  {
    redirectUrl: "",
    restrictDomain: true,
    applicationId: process.env.LOGIN_API_ID ?? "",
  },
  KeyStore.getSecretKey(),
  true
);

const port = process.env.PORT || 3000;

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

// the next parameter is needed!
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(500).json(err);
};

app.use(errorHandler);

app.listen(port, () => console.log(`Course Tool backend listening on port ${port}.`));
