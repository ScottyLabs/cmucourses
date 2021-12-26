import reactStringReplace from "react-string-replace";
import Link from "next/link";

export const courseIdRegex = /([0-9]{2}-?[0-9]{3})/g;

export const standardizeId = (id) => {
  if (!id.includes("-") && id.length >= 5) {
    let newString = id.slice(0, 2) + "-" + id.slice(2);
    return newString;
  }

  return id;
};

export const standardizeIdsInString = (str) => {
  return str.replaceAll(courseIdRegex, standardizeId);
};

export const sessionToShortString = (sessionInfo) => {
  const year = sessionInfo.year;
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

  if (semester === "summer") {
    return `${sessionStrings[sessionInfo.session]} ${sessionInfo.year}`;
  } else {
    return `${semesterStrings[sessionInfo.semester]} ${sessionInfo.year}`;
  }
};

export const compareSessions = (session1, session2) => {
  if (session1.year != session2.year) return session1.year < session2.year;

  const semesterNumbers = ["spring", "summer", "fall"];
  const sessionNumbers = [
    "summer all",
    "summer one",
    "summer two",
    "qatar summer",
  ];

  if (session1.semester !== session2.semester) {
    return (
      semesterNumbers.indexOf(session1.semester) <
      semesterNumbers.indexOf(session2.semester)
    );
  }

  if (session1.session !== session2.session) {
    return (
      sessionNumbers.indexOf(session1.session) <
      sessionNumbers.indexOf(session2.session)
    );
  }
};

export const filterSessions = (sessions) => {
  return sessions.filter((session) => {
    return (
      session.semester !== "summer" ||
      (session.session && session.session !== "qatar summer")
    );
  });
};

export const displayUnits = (units: string): string => {
  if (units.match(/[0-9]+\.[0-9]*/)) {
    return `${parseFloat(units).toString()}`;
  } else {
    return units;
  }
};

export const courseListToString = (courses: object[]): string => {
  return courses.length === 0 ? "None" : courses.join(", ");
};

export const injectLinks = (text) => {
  return reactStringReplace(text, courseIdRegex, (match, i) => (
    <Link
      href={`/course/${standardizeId(match)}`}
      sx={{ textDecoration: "underline" }}
    >
      {match}
    </Link>
  ));
};

export interface time {
  begin: string;
  end: string;
  days: string[];
}

export const timeArrToString = (times: time[]): string => {
  const daysOfTheWeek = ["M", "T", "W", "R", "F", "S", "U"];

  return times
    .map((curTime) => {
      if (!curTime.days) return "";
      const daysStr = curTime.days.map((day) => daysOfTheWeek[day]).join("");
      const timeStr = `${curTime.begin}-${curTime.end}`;
      return `${daysStr} ${timeStr}`;
    })
    .join(" ");
};
