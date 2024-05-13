import { Course, FCE } from "./types";
import { compareSessions, roundTo, sessionToShortString, responseRateZero, parseUnits, isValidUnits } from "./utils";

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

export const aggregateFCEs = (rawFces: FCE[]) => {
  const fces = rawFces.filter((fce) => !responseRateZero(fce));

  const fcesCounted = fces.length;
  const semesters = new Set();
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

export interface AggregateFCEsOptions {
  counted: {
    spring: boolean;
    summer: boolean;
    fall: boolean;
  };
  filters: {
    type: string;
    courses: string[];
    instructors: string[];
  };
  numSemesters: number;
}

export const filterFCEs = (fces: FCE[], options: AggregateFCEsOptions) => {
  const sortedFCEs = fces
    .filter((fce) => options.counted[fce.semester])
    .sort(compareSessions);
  let result: FCE[] = [];
  const encounteredSemesters = new Set();

  for (const fce of sortedFCEs) {
    encounteredSemesters.add(sessionToShortString(fce));
    if (encounteredSemesters.size > options.numSemesters) break;
    result.push(fce);
  }

  // Filter by courses
  if (options.filters.type === "courses" && options.filters.courses) {
    result = result.filter(({ courseID }) =>
      options.filters.courses.includes(courseID),
    );
  }

  // Filter by instructors
  if (options.filters.type === "instructors" && options.filters.instructors) {
    result = result.filter(({ instructor }) =>
      options.filters.instructors.includes(instructor),
    );
  }

  return result;
};

export const aggregateCourses = (
  data: { courseID: string; fces: FCE[] }[],
  courses: Course[],
  options: AggregateFCEsOptions
) => {
  const messages = [];
  const unitsMessage = [];

  const coursesWithoutFCEs = data
    .filter(({ fces }) => fces === null)
    .map(({ courseID }) => courseID);

  if (coursesWithoutFCEs.length > 0) {
    messages.push(
      `There are courses without any FCE data (${coursesWithoutFCEs.join(
        ", "
      )}). FCE data is estimated using the number of units.`
    );
  }

  const aggregatedFCEs = data
    .filter(({ fces }) => fces !== null)
    .map(({ courseID, fces }) => ({
      courseID,
      aggregateData: aggregateFCEs(filterFCEs(fces, options)),
    }));

  const coursesWithoutFilteredFCEs = aggregatedFCEs
    .filter(({ aggregateData }) => aggregateData.fcesCounted === 0)
    .map(({ courseID }) => courseID);

  if (coursesWithoutFilteredFCEs.length > 0) {
    messages.push(
      `There are courses with FCE data missing for the sampled semesters (${coursesWithoutFilteredFCEs.join(
        ", "
      )}).`
    );
  }

  let workload = 0;
  for (const aggregateFCE of aggregatedFCEs) {
    if (!aggregateFCE.aggregateData) continue;
    if (aggregateFCE.aggregateData.workload)
      workload += aggregateFCE.aggregateData.workload;
  }

  for (const courseID of coursesWithoutFCEs) {
    const findCourse = courses.filter((course) => course.courseID === courseID);
    if (findCourse.length > 0) workload += parseUnits(findCourse[0].units);
  }

  const totalUnits = courses.reduce((acc, curr) => acc + parseUnits(curr.units) + parseUnits(curr.manualUnits), 0);
  const varUnits = courses.filter((course) => !isValidUnits(course.units));
  if (varUnits.length > 0) {
    unitsMessage.push(
      `There are courses with variable units (${varUnits
        .map((course) => course.courseID)
        .join(", ")}). Input the number of units manually above.`
    );
  }

  return {
    aggregatedFCEs,
    workload,
    totalUnits,
    fceMessage: messages.join(" "),
    unitsMessage: unitsMessage.join(" "),
  };
};

export type AggregatedFCEs = ReturnType<typeof aggregateFCEs>;
