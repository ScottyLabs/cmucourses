import { Course, Time } from "./types";
import { CourseSessions, HoverSession } from "./userSchedules";
import { sessionToString, getCalendarColorLight } from "./utils";

const getTime = (day: number, time: string) => {
  const [h, minute] = time.split(":");
  let hour = h;
  if (h && time.slice(-2) === "PM" && time.slice(0, 2) !== "12") {
    hour = (parseInt(h) + 12).toString();
  }

  return new Date(
    2024,
    8,
    29 + day,
    parseInt(hour || "0"),
    parseInt(minute || "0")
  );
};

const getTimes = (
  courseID: string,
  sessionType: string,
  sessionTimes: Time[],
  color: string
) => {
  const times = [];
  for (const sessionTime of sessionTimes || []) {
    for (const day of sessionTime.days || []) {
      times.push({
        title: `${courseID} ${sessionType}`,
        start: getTime(day, sessionTime.begin || ""),
        end: getTime(day, sessionTime.end || ""),
        color,
      });
    }
  }
  return times;
};

interface Event {
  title: string;
  start: Date;
  end: Date;
  color: string;
}

export const getEvents = (
  CourseDetails: Course[],
  selectedSemester: string,
  selectedSessions: CourseSessions,
  hoverSession?: HoverSession
) => {
  let events: Event[] = [];

  const filteredCourses = CourseDetails.filter((course) => {
    const schedules = course.schedules;
    if (schedules) {
      return schedules.some(
        (sched) => sessionToString(sched) === selectedSemester
      );
    }
  });

  const selectedLectures = filteredCourses
    .flatMap((course) => {
      const lecture = course.schedules
        ?.find((sched) => sessionToString(sched) === selectedSemester)
        ?.lectures.find(
          (lecture) =>
            lecture.name === selectedSessions[course.courseID]?.Lecture
        );
      return {
        courseID: course.courseID,
        color: selectedSessions[course.courseID]?.Color || "",
        ...lecture,
      };
    })
    .filter((x) => x !== undefined);

  events = events.concat(
    selectedLectures
      .flatMap((lecture) => {
        if (lecture.times)
          return getTimes(
            lecture.courseID,
            lecture.name || "Lecture",
            lecture.times,
            lecture.color
          );
      })
      .filter((x) => x !== undefined)
  );

  const selectedSections = filteredCourses
    .flatMap((course) => {
      const section = course.schedules
        ?.find((sched) => sessionToString(sched) === selectedSemester)
        ?.sections.find(
          (section) =>
            section.name === selectedSessions[course.courseID]?.Section
        );
      return {
        courseID: course.courseID,
        color: selectedSessions[course.courseID]?.Color || "",
        ...section,
      };
    })
    .filter((x) => x !== undefined);

  events = events.concat(
    selectedSections
      .flatMap((section) => {
        if (section.times)
          return getTimes(
            section.courseID,
            `Section ${section.name || ""}`,
            section.times,
            section.color
          );
      })
      .filter((x) => x !== undefined)
  );

  if (hoverSession) {
    const courseID = hoverSession.courseID;
    const selectedCourse = filteredCourses.find(
      (course) => course.courseID === courseID
    );

    const hoverLecture = selectedCourse?.schedules
      ?.find((sched) => sessionToString(sched) === selectedSemester)
      ?.lectures.find((lecture) => lecture.name === hoverSession["Lecture"]);

    const hoverSection = selectedCourse?.schedules
      ?.find((sched) => sessionToString(sched) === selectedSemester)
      ?.sections.find((section) => section.name === hoverSession["Section"]);

    const hoverColor =
      getCalendarColorLight(`${selectedSessions[courseID]?.Color}`) || "";
    if (hoverLecture)
      events.push(
        ...getTimes(
          courseID,
          hoverLecture.name || "Lecture",
          hoverLecture.times,
          hoverColor
        )
      );

    if (hoverSection)
      events.push(
        ...getTimes(
          courseID,
          `Section ${hoverSection?.name || ""}`,
          hoverSection?.times,
          hoverColor
        )
      );
  }

  return events;
};
