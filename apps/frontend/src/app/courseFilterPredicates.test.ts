import { courseMatchesClientFilters } from "./courseFilterPredicates";
import type { Course } from "./types";

const course = (building = "WEH"): Course => ({
  courseID: "15-213",
  name: "Introduction to Computer Systems",
  desc: "",
  department: "Computer Science",
  units: "12",
  prereqs: [],
  prereqString: "",
  coreqs: [],
  crosslisted: [],
  schedules: [
    {
      courseID: "15-213",
      year: "2026",
      semester: "fall",
      lectures: [
        {
          name: "Lec 1",
          instructors: [],
          location: "Pittsburgh",
          times: [
            {
              days: [1, 3],
              begin: "10:00AM",
              end: "10:50AM",
              building,
              room: "7500",
            },
          ],
        },
      ],
      sections: [],
    },
  ],
});

describe("courseMatchesClientFilters", () => {
  test("matches allowed days and an exact time window", () => {
    expect(
      courseMatchesClientFilters(
        course(),
        { meetingDays: [1, 3], timeRange: { begin: 9 * 60, end: 12 * 60 } },
        []
      )
    ).toBe(true);
    expect(
      courseMatchesClientFilters(course(), { meetingDays: [2, 4] }, [])
    ).toBe(false);
  });

  test("infers remote modality from catalog locations", () => {
    expect(
      courseMatchesClientFilters(
        course("CMU REMOTE"),
        { modalities: ["REMOTE"] },
        []
      )
    ).toBe(true);
    expect(
      courseMatchesClientFilters(course(), { modalities: ["REMOTE"] }, [])
    ).toBe(false);
  });

  test("filters to courses that fit saved availability", () => {
    expect(
      courseMatchesClientFilters(course(), { fitAvailability: true }, [
        { day: 1, begin: 8 * 60, end: 9 * 60, label: null },
      ])
    ).toBe(true);
    expect(
      courseMatchesClientFilters(course(), { fitAvailability: true }, [
        { day: 1, begin: 10 * 60, end: 11 * 60, label: null },
        { day: 3, begin: 10 * 60, end: 11 * 60, label: null },
      ])
    ).toBe(false);
  });
});
