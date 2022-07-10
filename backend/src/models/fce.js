import mongoose from "mongoose";

export const fceSchema = new mongoose.Schema({
  courseID: String,
  year: String,
  semester: String,
  location: String,
  college: String,
  instructor: String,
  andrewID: String,
  department: String,
  courseName: String,
  level: String,
  possibleRespondents: Number,
  numRespondents: Number,
  responseRate: String,
  hrsPerWeek: Number,
  rating: [Number],
});

export const FCE = mongoose.model("FCE", fceSchema);
