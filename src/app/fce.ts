import { AggregateFCEsOptions, FCE } from "./types";
import { compareSessions, roundTo, sessionToShortString } from "./utils";

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

  for (const fce of fces) {
    workload += fce.hrsPerWeek;
    teachingRate += fce.rating[7];
    courseRate += fce.rating[8];
    semesters.add(sessionToShortString(fce));
  }

  if (fcesCounted === 0) {
    return {
      fcesCounted: 0,
      semestersCounted: 0,
    };
  }

  return {
    workload: roundTo(workload / fcesCounted, 2),
    teachingRate: roundTo(teachingRate / fcesCounted, 2),
    courseRate: roundTo(courseRate / fcesCounted, 2),
    fcesCounted,
    semestersCounted: semesters.size,
  };
};

export const filterFCEs = (fces: FCE[], options: AggregateFCEsOptions) => {
  const sortedFCEs = fces
    .filter((fce) => options.counted[fce.semester])
    .sort(compareSessions);
  const result = [];
  const encounteredSemesters = new Set();

  for (const fce of sortedFCEs) {
    encounteredSemesters.add(sessionToShortString(fce));
    if (encounteredSemesters.size > options.numSemesters) break;
    result.push(fce);
  }

  return result;
};

export const aggregateCourses = (
  data: { courseID: string; fces: FCE[] }[],
  options: AggregateFCEsOptions
) => {
  let message = "";

  const coursesWithoutFCEs = data
    .filter(({ courseID, fces }) => fces === null)
    .map(({ courseID }) => courseID);
  if (coursesWithoutFCEs.length > 0) {
    message += `There are courses with missing data (${coursesWithoutFCEs.join(
      ", "
    )}).`;
  }

  let aggregatedFCEs = data
    .filter(({ courseID, fces }) => fces !== null)
    .map(({ courseID, fces }) => ({
      courseID,
      aggregateData: aggregateFCEs(filterFCEs(fces, options)),
    }));

  let workload = 0;
  for (const aggregateFCE of aggregatedFCEs) {
    if (!aggregateFCE.aggregateData) continue;
    if (aggregateFCE.aggregateData.workload)
      workload += aggregateFCE.aggregateData.workload;
  }

  return {
    aggregatedFCEs,
    workload,
    message,
  };
};
