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

const parseTimeInMinutes = (time: string) => {
  const match = /^(\d{1,2}):(\d{2})(AM|PM)$/i.exec(time);
  if (!match) return undefined;

  const hourText = match[1];
  const minuteText = match[2];
  const period = match[3];
  if (!hourText || !minuteText || !period) return undefined;

  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return undefined;

  return (
    (hour % 12) * 60 + minute + (period.toUpperCase() === "PM" ? 12 * 60 : 0)
  );
};

/**
 * A few studio courses model their section as the full meeting block and their
 * linked lecture as a shorter block inside it. Keep lecture meetings that are
 * genuinely separate, but do not draw the contained time twice.
 */
export const getVisibleLectureTimes = (
  lectureTimes: Time[],
  linkedSectionTimes: Time[]
): Time[] =>
  lectureTimes.flatMap((lectureTime) => {
    const lectureStart = parseTimeInMinutes(lectureTime.begin);
    const lectureEnd = parseTimeInMinutes(lectureTime.end);

    if (lectureStart === undefined || lectureEnd === undefined) {
      return [lectureTime];
    }

    const visibleDays = lectureTime.days.filter(
      (day) =>
        !linkedSectionTimes.some((sectionTime) => {
          if (!sectionTime.days.includes(day)) return false;

          const sectionStart = parseTimeInMinutes(sectionTime.begin);
          const sectionEnd = parseTimeInMinutes(sectionTime.end);
          return (
            sectionStart !== undefined &&
            sectionEnd !== undefined &&
            sectionStart <= lectureStart &&
            sectionEnd >= lectureEnd
          );
        })
    );

    return visibleDays.length > 0
      ? [{ ...lectureTime, days: visibleDays }]
      : [];
  });

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
    selectedLectures
      .flatMap((lecture) => {
        if (lecture.times) {
          const linkedSection = selectedSections.find(
            (section) =>
              section.courseID === lecture.courseID &&
              section.lecture === lecture.name
          );
          const visibleTimes = getVisibleLectureTimes(
            lecture.times,
            linkedSection?.times || []
          );

          return getTimes(
            lecture.courseID,
            lecture.name || "Lecture",
            visibleTimes,
            lecture.color
          );
        }
      })
      .filter((x) => x !== undefined)
  );

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
    if (hoverLecture) {
      const linkedSectionTimes =
        hoverSection?.lecture === hoverLecture.name ? hoverSection.times : [];
      events.push(
        ...getTimes(
          courseID,
          hoverLecture.name || "Lecture",
          getVisibleLectureTimes(hoverLecture.times, linkedSectionTimes),
          hoverColor
        )
      );
    }

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
