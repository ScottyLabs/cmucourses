import reactStringReplace from "react-string-replace";
import Link from "~/components/Link";
import { FCE, Schedule, Session, Time } from "./types";
import { AggregateFCEsOptions, filterFCEs } from "./fce";
import { DEPARTMENT_MAP_NAME, DEPARTMENT_MAP_SHORTNAME } from "./constants";
import namecase from "namecase";

export const courseIdRegex = /([0-9]{2}-?[0-9]{3})/g;

export const standardizeId = (id: string) => {
  if (id && !id.includes("-") && id.length >= 5) {
    return id.slice(0, 2) + "-" + id.slice(2);
  }

  return id;
};

export const standardizeIdsInString = (str: string) => {
  return str.replaceAll(courseIdRegex, standardizeId);
};

export const sessionToString = (sessionInfo: Session | FCE | Schedule) => {
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

export const sessionToShortString = (sessionInfo: Session | FCE | Schedule) => {
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
  session2: Session | FCE
): number => {
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
    if (!session1.session) return 1;
    if (!session2.session) return -1;

    return sessionNumbers.indexOf(session1.session) <
      sessionNumbers.indexOf(session2.session)
      ? 1
      : -1;
  }

  return 0;
};

export function filterSessions<T extends Session>(sessions: T[]): T[] {
  return sessions.filter((session) => {
    return (
      session.semester !== "summer" ||
      (session.session && session.session !== "qatar summer")
    );
  });
}

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
      <Link href={`/course/${standardizeId(match)}`} key={`${match}-${i}`}>
        {match}
      </Link>
    )
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

export function roundTo(num: number, precision = 2) {
  const x = Math.pow(10, precision);
  return Math.round(num * x) / x;
}

const exactSearchRegex = new RegExp(
  "(" + courseIdRegex.source + "\\s+)*" + courseIdRegex.source + "\\s*"
);

export function isExactSearch(search: string): boolean {
  return exactSearchRegex.test(search);
}

export function getCourseIDs(search: string): string[] {
  return search.match(courseIdRegex) || [];
}

export function classNames(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getDepartmentByName(name: string) {
  return DEPARTMENT_MAP_NAME[name];
}

export function getDepartmentByShortName(shortName: string) {
  return DEPARTMENT_MAP_SHORTNAME[shortName];
}

export function removeFromSet<T>(arr: T[], item: T): T[] {
  return arr.filter((x) => x !== item);
}

export function addToSet<T>(arr: T[], item: T): T[] {
  if (arr.indexOf(item) === -1) {
    return [...arr, item];
  } else {
    return arr;
  }
}

export function toNameCase(name: string): string {
  // Eventually we should get rid of this function altogether by
  // getting the proper names from the Directory, but this will do for now.

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return namecase(name) as string;
}

export function getUnique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function responseRateZero(fce: FCE): boolean {
  // Honestly don't know why responseRate is a string in the first place
  // Just trying to catch the possible reasonable edge cases
  return ["0", "0.0", "0.00", "0%", "0.0%", "0.00%"].includes(fce.responseRate);
}

export function isValidUnits(units: string): boolean {
  const re = /^\d+(\.\d+)?$/;
  return re.test(units);
}

export function parseUnits(units: string): number {
  if (isValidUnits(units)) {
    return parseFloat(units);
  }
  return 0.0;
}
