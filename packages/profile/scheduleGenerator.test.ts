import { describe, expect, test } from "bun:test";
import { generateSchedules, type CandidateCourse, type GeneratorInput } from "./scheduleGenerator";
import { DEFAULT_SCHEDULE_PREFERENCES, type BusyBlock } from "./schema";

const block = (day: number, begin: number, end: number): BusyBlock => ({ day, begin, end, label: null });

/** A course with a single lecture, no sections, at a fixed time. */
const simpleCourse = (courseID: string, units: number, begin: string, end: string, days = [1, 3]): CandidateCourse => ({
  courseID,
  units,
  lectures: [{ name: "Lec 1", times: [{ days, begin, end }], sections: [] }],
});

const baseInput: GeneratorInput = {
  courses: [],
  busyBlocks: [],
  workload: null,
  careers: [],
  skillsWant: [],
  skillsHave: [],
  preferences: DEFAULT_SCHEDULE_PREFERENCES,
  preferredModality: null,
};

describe("generateSchedules", () => {
  test("returns [] for no courses", () => {
    expect(generateSchedules({ ...baseInput, courses: [] })).toEqual([]);
  });

  test("two courses with no time overlap fit cleanly", () => {
    const result = generateSchedules({
      ...baseInput,
      courses: [simpleCourse("15-213", 12, "10:00AM", "10:50AM"), simpleCourse("15-122", 10, "02:00PM", "02:50PM")],
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]!.availability.status).toBe("UNKNOWN"); // no busyBlocks given -> nothing to judge against
    expect(result[0]!.picks).toHaveLength(2);
  });

  test("a course with zero lecture options is excluded from picks but not dropped from the candidate", () => {
    const empty: CandidateCourse = { courseID: "99-999", units: 9, lectures: [] };
    const result = generateSchedules({ ...baseInput, courses: [empty] });
    expect(result).toHaveLength(1);
    expect(result[0]!.picks).toHaveLength(0);
    expect(result[0]!.reasons.some((r) => r.includes("99-999"))).toBe(true);
  });

  test("every option conflicting with busy blocks still produces a candidate, marked CONFLICTS", () => {
    const result = generateSchedules({
      ...baseInput,
      courses: [simpleCourse("15-213", 12, "10:00AM", "10:50AM")],
      busyBlocks: [block(1, 9 * 60, 12 * 60)],
    });
    expect(result).toHaveLength(1);
    expect(result[0]!.availability.status).toBe("CONFLICTS");
    expect(result[0]!.availability.conflicts).toEqual(["15-213"]);
  });

  test("returns no candidate when every combination has a cross-course conflict", () => {
    const a = simpleCourse("15-213", 12, "10:00AM", "10:50AM");
    const b = simpleCourse("15-122", 10, "10:00AM", "10:50AM"); // identical slot, same days
    const result = generateSchedules({ ...baseInput, courses: [a, b] });
    expect(result).toEqual([]);
  });

  test("chooses a non-conflicting option instead of an overlapping one", () => {
    const fixed = simpleCourse("15-213", 12, "10:00AM", "10:50AM");
    const flexible: CandidateCourse = {
      courseID: "15-122",
      units: 10,
      lectures: [
        {
          name: "Conflicting",
          times: [{ days: [1, 3], begin: "10:00AM", end: "10:50AM" }],
          sections: [],
        },
        {
          name: "Valid",
          times: [{ days: [1, 3], begin: "11:00AM", end: "11:50AM" }],
          sections: [],
        },
      ],
    };

    const result = generateSchedules({ ...baseInput, courses: [fixed, flexible] });

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]!.picks.find((pick) => pick.courseID === "15-122")?.lecture).toBe("Valid");
  });

  test("workload UNKNOWN when profile.workload is null", () => {
    const result = generateSchedules({
      ...baseInput,
      courses: [simpleCourse("15-213", 12, "10:00AM", "10:50AM")],
      workload: null,
    });
    expect(result[0]!.workloadFit).toBe("UNKNOWN");
  });

  test("workload IN_RANGE / UNDER / OVER buckets", () => {
    const course = simpleCourse("15-213", 12, "10:00AM", "10:50AM");
    const inRange = generateSchedules({
      ...baseInput,
      courses: [course],
      workload: { unitsMin: 9, unitsMax: 15, hoursPerWeek: null },
    });
    expect(inRange[0]!.workloadFit).toBe("IN_RANGE");

    const under = generateSchedules({
      ...baseInput,
      courses: [course],
      workload: { unitsMin: 24, unitsMax: 36, hoursPerWeek: null },
    });
    expect(under[0]!.workloadFit).toBe("UNDER");

    const over = generateSchedules({
      ...baseInput,
      courses: [course],
      workload: { unitsMin: 0, unitsMax: 6, hoursPerWeek: null },
    });
    expect(over[0]!.workloadFit).toBe("OVER");
  });

  test("career scoring: a course teaching a primary career's core skill scores higher than one that doesn't", () => {
    // 15-213 teaches systems-programming, a core skill of systems-infra (per courseSkills.ts /
    // careerSkills.ts fixtures already covered in mapping.test.ts).
    const withGoal = generateSchedules({
      ...baseInput,
      courses: [simpleCourse("15-213", 12, "10:00AM", "10:50AM")],
      careers: ["systems-infra"],
    });
    const withoutGoal = generateSchedules({
      ...baseInput,
      courses: [simpleCourse("15-213", 12, "10:00AM", "10:50AM")],
      careers: [],
    });
    expect(withGoal[0]!.careerScore).toBeGreaterThan(withoutGoal[0]!.careerScore);
    expect(withGoal[0]!.totalScore).toBeGreaterThan(withoutGoal[0]!.totalScore);
  });

  test("skillsHave already covering a course's skills means no career score contribution from those skills", () => {
    const result = generateSchedules({
      ...baseInput,
      courses: [simpleCourse("15-213", 12, "10:00AM", "10:50AM")],
      careers: ["systems-infra"],
      skillsHave: ["systems-programming"],
    });
    // Still may score on other skills 15-213 teaches, but strictly less than having none of them.
    const withoutHave = generateSchedules({
      ...baseInput,
      courses: [simpleCourse("15-213", 12, "10:00AM", "10:50AM")],
      careers: ["systems-infra"],
      skillsHave: [],
    });
    expect(result[0]!.careerScore).toBeLessThanOrEqual(withoutHave[0]!.careerScore);
  });

  test("unknown career ids are ignored rather than throwing", () => {
    expect(() =>
      generateSchedules({
        ...baseInput,
        courses: [simpleCourse("15-213", 12, "10:00AM", "10:50AM")],
        careers: ["not-a-real-career"],
      })
    ).not.toThrow();
  });

  test("returns up to maxCandidates, sorted by score descending", () => {
    // Course with 3 non-overlapping lecture options, each a different quality of fit.
    const multi: CandidateCourse = {
      courseID: "15-213",
      units: 12,
      lectures: [
        { name: "Lec A", times: [{ days: [1], begin: "08:00AM", end: "08:50AM" }], sections: [] },
        { name: "Lec B", times: [{ days: [1], begin: "10:00AM", end: "10:50AM" }], sections: [] },
        { name: "Lec C", times: [{ days: [1], begin: "02:00PM", end: "02:50PM" }], sections: [] },
      ],
    };
    const result = generateSchedules({ ...baseInput, courses: [multi], maxCandidates: 2 });
    expect(result.length).toBeLessThanOrEqual(2);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1]!.totalScore).toBeGreaterThanOrEqual(result[i]!.totalScore);
    }
  });

  test("saved time preferences rank matching sections first", () => {
    const multi: CandidateCourse = {
      courseID: "15-213",
      units: 12,
      lectures: [
        {
          name: "Early",
          times: [{ days: [1], begin: "08:00AM", end: "08:50AM" }],
          sections: [],
        },
        {
          name: "Preferred",
          times: [{ days: [2], begin: "11:00AM", end: "11:50AM" }],
          sections: [],
        },
      ],
    };
    const result = generateSchedules({
      ...baseInput,
      courses: [multi],
      preferences: {
        ...DEFAULT_SCHEDULE_PREFERENCES,
        earliestStart: 10 * 60,
        preferredDays: [2],
      },
    });
    expect(result[0]!.picks[0]!.lecture).toBe("Preferred");
  });

  test("respects sections nested under a lecture", () => {
    const withSections: CandidateCourse = {
      courseID: "15-213",
      units: 12,
      lectures: [
        {
          name: "Lec 1",
          times: [{ days: [1, 3], begin: "10:00AM", end: "10:50AM" }],
          sections: [
            { name: "A", times: [{ days: [5], begin: "10:00AM", end: "10:50AM" }] },
            { name: "B", times: [{ days: [5], begin: "11:00AM", end: "11:50AM" }] },
          ],
        },
      ],
    };
    const result = generateSchedules({ ...baseInput, courses: [withSections] });
    expect(result[0]!.picks[0]!.section).not.toBeNull();
    // Both lecture and section times are attended, so both show up.
    expect(result[0]!.picks[0]!.times.length).toBe(2);
  });

  test("large combinatorics stay fast (regression guard against full cartesian product)", () => {
    const manyOptions = (courseID: string, courseIndex: number): CandidateCourse => {
      const hour = 8 + courseIndex;
      const displayHour = hour > 12 ? hour - 12 : hour;
      const period = hour >= 12 ? "PM" : "AM";
      const begin = `${displayHour.toString().padStart(2, "0")}:00${period}`;
      const end = `${displayHour.toString().padStart(2, "0")}:50${period}`;

      return {
        courseID,
        units: 9,
        lectures: Array.from({ length: 5 }, (_, i) => ({
          name: `Lec ${i}`,
          // Every course has a distinct hour and five day choices. This retains the 5^8 search
          // space while guaranteeing that conflict-free complete schedules exist.
          times: [
            {
              days: [(i % 5) + 1],
              begin,
              end,
            },
          ],
          sections: [],
        })),
      };
    };
    const courses = Array.from({ length: 8 }, (_, i) => manyOptions(`10-${100 + i}`, i));
    const start = performance.now();
    const result = generateSchedules({ ...baseInput, courses });
    const elapsed = performance.now() - start;
    expect(result.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(1000);
  });
});
