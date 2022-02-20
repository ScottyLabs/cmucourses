import { FCE } from "./types";
import { getLatestFCEs, roundTo, sessionToShortString } from "./utils";

export const FCE_RATINGS = [
  "Interest in student learning",
  "Clearly explain course requirements",
  "Clear learning objectives & goals",
  "Instructor provides feedback to students to improve",
  "Demonstrate importance of subject matter",
  "Explains subject matter of course",
  "Show respect for all students",
  "Overall teaching rate",
  "Overall course rate",
];

export const aggregateFCEs = (fces: FCE[]) => {
  let fcesCounted = fces.length;
  let semesters = new Set();
  let workload = 0;
  let teachingRate = 0;
  let courseRate = 0;

  // TODO: incorrectly counts unique semesters

  for (const fce of fces) {
    workload += fce.hrsPerWeek;
    teachingRate += fce.rating[7];
    courseRate += fce.rating[8];
    semesters.add(sessionToShortString(fce));
  }

  if (fcesCounted === 0) {
    return null;
  }

  return {
    workload: roundTo(workload / fcesCounted, 2),
    teachingRate: roundTo(teachingRate / fcesCounted, 2),
    courseRate: roundTo(courseRate / fcesCounted, 2),
    fcesCounted,
    semestersCounted: semesters.size
  };
};
