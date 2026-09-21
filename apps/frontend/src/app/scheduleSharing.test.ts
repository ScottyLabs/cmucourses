import {
  buildScheduleICS,
  decodeSharedSchedule,
  encodeSharedSchedule,
} from "./scheduleSharing";
import type { Course } from "./types";
import type { UserSchedule } from "./userSchedules";

const schedule: UserSchedule = {
  id: "one",
  name: "Studio plan",
  courses: ["48-200"],
  selected: ["48-200"],
  session: { semester: "fall", year: "2026" },
  courseSessions: {
    "48-200": { Lecture: "Lec 1", Section: "A", Color: "#fff" },
  },
  numColors: 1,
};

const details: Course[] = [
  {
    courseID: "48-200",
    name: "Studio",
    desc: "",
    department: "Architecture",
    units: "18",
    prereqs: [],
    prereqString: "",
    coreqs: [],
    crosslisted: [],
    schedules: [
      {
        courseID: "48-200",
        semester: "fall",
        year: "2026",
        lectures: [
          {
            name: "Lec 1",
            instructors: [],
            location: "",
            times: [
              {
                days: [1],
                begin: "02:00PM",
                end: "03:50PM",
                building: "",
                room: "",
              },
            ],
          },
        ],
        sections: [
          {
            name: "A",
            lecture: "Lec 1",
            instructors: [],
            location: "",
            times: [
              {
                days: [1],
                begin: "02:00PM",
                end: "04:50PM",
                building: "CFA",
                room: "200",
              },
            ],
          },
        ],
      },
    ],
  },
];

describe("schedule sharing", () => {
  test("round-trips a full schedule payload", () => {
    expect(decodeSharedSchedule(encodeSharedSchedule(schedule))).toEqual({
      version: 1,
      name: schedule.name,
      courses: schedule.courses,
      selected: schedule.selected,
      session: schedule.session,
      courseSessions: schedule.courseSessions,
    });
  });

  test("exports a recurring ICS without duplicating a contained lecture", () => {
    const ics = buildScheduleICS(schedule, details);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("SUMMARY:48-200 Section A");
    expect(ics).not.toContain("SUMMARY:48-200 Lec 1");
    expect(ics).toContain("RRULE:FREQ=WEEKLY");
  });
});
