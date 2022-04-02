import reactStringReplace from "react-string-replace";
import Link from "next/link";
import { AggregateFCEsOptions, FCE, Session, Time } from "./types";

export const courseIdRegex = /([0-9]{2}-?[0-9]{3})/g;

export const standardizeId = (id: string) => {
  if (!id.includes("-") && id.length >= 5) {
    let newString = id.slice(0, 2) + "-" + id.slice(2);
    return newString;
  }

  return id;
};

export const standardizeIdsInString = (str: string) => {
  return str.replaceAll(courseIdRegex, standardizeId);
};

export const sessionToString = (sessionInfo: Session | FCE) => {
  const semester = sessionInfo.semester;

  const sessionStrings = {
    "summer one": "Summer One",
    "summer two": "Summer Two",
    "summer all": "Summer All",
    "qatar summer": "Qatar Summer",
  };

  const semesterStrings = {
    fall: "Fall",
    summer: "Summer",
    spring: "Spring",
  };

  if (semester === "summer" && sessionInfo.session) {
    return `${sessionStrings[sessionInfo.session]} ${sessionInfo.year}`;
  } else {
    return `${semesterStrings[sessionInfo.semester]} ${sessionInfo.year}`;
  }
};

export const sessionToShortString = (sessionInfo: Session | FCE) => {
  const semester = sessionInfo.semester;

  const sessionStrings = {
    "summer one": "M1",
    "summer two": "M2",
    "summer all": "MA",
    "qatar summer": "MQ",
  };

  const semesterStrings = {
    fall: "F",
    summer: "M",
    spring: "S",
  };

  if (semester === "summer" && sessionInfo.session) {
    return `${sessionStrings[sessionInfo.session]} ${sessionInfo.year}`;
  } else {
    return `${semesterStrings[sessionInfo.semester]} ${sessionInfo.year}`;
  }
};

export const compareSessions = (
  session1: Session | FCE,
  session2: Session | FCE,
) => {
  if (session1.year != session2.year)
    return session1.year < session2.year ? 1 : -1;

  const semesterNumbers = ["spring", "summer", "fall"];
  const sessionNumbers = [
    "summer all",
    "summer one",
    "summer two",
    "qatar summer",
  ];

  if (session1.semester !== session2.semester) {
    return semesterNumbers.indexOf(session1.semester) <
    semesterNumbers.indexOf(session2.semester)
      ? 1
      : -1;
  }

  if (session1.session !== session2.session) {
    return sessionNumbers.indexOf(session1.session) <
    sessionNumbers.indexOf(session2.session)
      ? 1
      : -1;
  }
};

export const filterSessions = (sessions: Session[]) => {
  return sessions.filter((session) => {
    return (
      session.semester !== "summer" ||
      (session.session && session.session !== "qatar summer")
    );
  });
};

export const filterFCEs = (fces: FCE[], options: AggregateFCEsOptions) => {
  const sortedFCEs = fces.filter(fce => options.counted[fce.semester]).sort(compareSessions);
  const result = [];
  const encounteredSemesters = new Set();

  for (const fce of sortedFCEs) {
    encounteredSemesters.add(sessionToShortString(fce));
    if (encounteredSemesters.size > options.numSemesters) break;
    result.push(fce);
  }

  return result;
};

export const displayUnits = (units: string): string => {
  if (units.match(/[0-9]+\.[0-9]*/)) {
    return `${parseFloat(units).toString()}`;
  } else {
    return units;
  }
};

export const courseListToString = (courses: string[]): string => {
  return courses.length === 0 ? "None" : courses.join(", ");
};

export const injectLinks = (text: string) => {
  return reactStringReplace(
    standardizeIdsInString(text),
    courseIdRegex,
    (match, i) => (
      <Link href={`/course/${standardizeId(match)}`} key={match}>
        <span className="hover:underline hover:cursor-pointer">{match}</span>
      </Link>
    ),
  );
};

export const timeArrToString = (times: Time[]) => {
  const daysOfTheWeek = ["U", "M", "T", "W", "R", "F", "S"];

  return times
    .map((curTime) => {
      if (!curTime.days) return "";
      const daysStr = curTime.days.map((day) => daysOfTheWeek[day]).join("");
      const timeStr = `${curTime.begin}-${curTime.end}`;
      return `${daysStr} ${timeStr}`;
    })
    .join(" ");
};

export const approximateHours = (
  fces: FCE[],
  options: AggregateFCEsOptions
): number | undefined => {
  if (fces.length === 0) {
    return undefined;
  }

  const filteredFCEs = filterFCEs(fces, options);

  let sum = 0;
  for (const fce of filteredFCEs) {
    sum += fce.hrsPerWeek;
  }

  return filteredFCEs.length === 0
    ? undefined
    : roundTo(sum / filteredFCEs.length, 1);
};

export function roundTo(num: number, precision: number = 2) {
  let x = Math.pow(10, precision);
  return Math.round(num * x) / x;
}
