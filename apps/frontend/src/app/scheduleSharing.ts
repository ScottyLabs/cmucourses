import type { Course, Session, Time } from "./types";
import type { CourseSessions, UserSchedule } from "./userSchedules";
import { getVisibleLectureTimes } from "./events";
import { sessionToString } from "./utils";

export interface SharedScheduleData {
  version: 1;
  name: string;
  courses: string[];
  selected: string[];
  session: Session;
  courseSessions: CourseSessions;
}

export const toSharedScheduleData = (
  schedule: UserSchedule
): SharedScheduleData => ({
  version: 1,
  name: schedule.name,
  courses: schedule.courses,
  selected: schedule.selected,
  session: schedule.session,
  courseSessions: schedule.courseSessions,
});

const bytesToBase64 = (bytes: Uint8Array) => {
  let value = "";
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
};

const base64ToBytes = (value: string) => {
  const padded = value
    .replaceAll("-", "+")
    .replaceAll("_", "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  const decoded = atob(padded);
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
};

export const encodeSharedSchedule = (schedule: UserSchedule): string =>
  bytesToBase64(
    new TextEncoder().encode(JSON.stringify(toSharedScheduleData(schedule)))
  );

export const decodeSharedSchedule = (
  encoded: string
): SharedScheduleData | null => {
  try {
    const value = JSON.parse(
      new TextDecoder().decode(base64ToBytes(encoded))
    ) as Partial<SharedScheduleData>;
    if (
      value.version !== 1 ||
      typeof value.name !== "string" ||
      !Array.isArray(value.courses) ||
      !value.courses.every((course) => /^\d{2}-\d{3}$/.test(course)) ||
      !Array.isArray(value.selected) ||
      !value.session ||
      typeof value.courseSessions !== "object" ||
      value.courseSessions === null
    )
      return null;
    return value as SharedScheduleData;
  } catch {
    return null;
  }
};

const parseClock = (time: string): { hour: number; minute: number } | null => {
  const match = /^(\d{1,2}):(\d{2})(AM|PM)$/i.exec(time);
  if (!match) return null;
  const rawHour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3]?.toUpperCase();
  if (rawHour < 1 || rawHour > 12 || minute > 59) return null;
  return {
    hour: (rawHour % 12) + (period === "PM" ? 12 : 0),
    minute,
  };
};

const termBounds = (session: Session): { start: Date; end: Date } | null => {
  const year = Number(session.year);
  if (!Number.isInteger(year) || session.semester === "") return null;
  if (session.semester === "spring")
    return { start: new Date(year, 0, 8), end: new Date(year, 4, 15) };
  if (session.semester === "summer")
    return { start: new Date(year, 4, 15), end: new Date(year, 7, 15) };
  return { start: new Date(year, 7, 20), end: new Date(year, 11, 15) };
};

const pad = (value: number) => String(value).padStart(2, "0");
const icsDate = (date: Date) =>
  `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
const icsDay = (date: Date) =>
  `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T235900`;
const escapeICS = (value: string) =>
  value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\n", "\\n");

interface ExportMeeting {
  courseID: string;
  label: string;
  time: Time;
}

const exportMeetings = (
  schedule: UserSchedule,
  courses: Course[]
): ExportMeeting[] => {
  const semester = sessionToString(schedule.session);
  return courses.flatMap((course) => {
    const offering = course.schedules?.find(
      (candidate) => sessionToString(candidate) === semester
    );
    const selection = schedule.courseSessions[course.courseID];
    const lecture = offering?.lectures.find(
      (candidate) => candidate.name === selection?.Lecture
    );
    const section = offering?.sections.find(
      (candidate) => candidate.name === selection?.Section
    );
    const lectureTimes = lecture
      ? getVisibleLectureTimes(
          lecture.times,
          section?.lecture === lecture.name ? section.times : []
        )
      : [];
    return [
      ...lectureTimes.map((time) => ({
        courseID: course.courseID,
        label: lecture?.name ?? "Lecture",
        time,
      })),
      ...(section?.times ?? []).map((time) => ({
        courseID: course.courseID,
        label: `Section ${section?.name ?? ""}`,
        time,
      })),
    ];
  });
};

export const buildScheduleICS = (
  schedule: UserSchedule,
  courses: Course[]
): string => {
  const bounds = termBounds(schedule.session);
  if (!bounds) return "";
  const events: string[] = [];
  exportMeetings(schedule, courses).forEach((meeting, meetingIndex) => {
    const begin = parseClock(meeting.time.begin);
    const end = parseClock(meeting.time.end);
    if (!begin || !end) return;
    meeting.time.days.forEach((day) => {
      const first = new Date(bounds.start);
      first.setDate(first.getDate() + ((day - first.getDay() + 7) % 7));
      const start = new Date(first);
      start.setHours(begin.hour, begin.minute, 0, 0);
      const finish = new Date(first);
      finish.setHours(end.hour, end.minute, 0, 0);
      const location = [meeting.time.building, meeting.time.room]
        .filter(Boolean)
        .join(" ");
      events.push(
        [
          "BEGIN:VEVENT",
          `UID:${meeting.courseID}-${meetingIndex}-${day}@cmucourses`,
          `DTSTART:${icsDate(start)}`,
          `DTEND:${icsDate(finish)}`,
          `RRULE:FREQ=WEEKLY;UNTIL=${icsDay(bounds.end)}`,
          `SUMMARY:${escapeICS(`${meeting.courseID} ${meeting.label}`)}`,
          location ? `LOCATION:${escapeICS(location)}` : "",
          "END:VEVENT",
        ]
          .filter(Boolean)
          .join("\r\n")
      );
    });
  });
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CMU Courses//Schedule//EN",
    "CALSCALE:GREGORIAN",
    ...events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
};

export const downloadScheduleICS = (
  schedule: UserSchedule,
  courses: Course[]
) => {
  const contents = buildScheduleICS(schedule, courses);
  if (!contents) return false;
  const url = URL.createObjectURL(
    new Blob([contents], { type: "text/calendar" })
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${
    schedule.name
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "schedule"
  }.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
  return true;
};
