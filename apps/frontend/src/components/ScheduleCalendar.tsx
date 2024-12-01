import React, { useMemo } from "react";
import { Calendar, DateLocalizer, momentLocalizer } from "react-big-calendar";
import PropTypes from 'prop-types'
import * as dates from 'date-arithmetic'
import TimeGrid from 'react-big-calendar/lib/TimeGrid'
import Toolbar from 'react-big-calendar/lib/Toolbar'
import style from "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { useAppSelector } from "~/app/hooks";
import { Course, Time } from "~/app/types";
import { sessionToString } from "~/app/utils";
import {
  CourseSessions, HoverSession,
  selectCourseSessionsInActiveSchedule,
  selectHoverSessionInActiveSchedule,
  selectSessionInActiveSchedule
} from "~/app/userSchedules";
import { useFetchCourseInfos } from "~/app/api/course";

const localizer = momentLocalizer(moment);

function Week({
  date,
  max = localizer.endOf(new Date(), 'day'),
  min = localizer.startOf(new Date(), 'day'),
  scrollToTime = localizer.startOf(new Date(), 'day'),
  ...props
} : { date: Date, max: Date, min: Date, scrollToTime: Date }) {
  const currRange = useMemo(
    () => Week.range(date, { localizer }),
    [date, localizer]
  )

  return (
    <TimeGrid
      style={style}
      date={date}
      eventOffset={15}
      localizer={localizer}
      max={max}
      min={min}
      range={currRange}
      scrollToTime={scrollToTime}
      {...props}
    />
  )
}

Week.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  localizer: PropTypes.object,
  max: PropTypes.instanceOf(Date),
  min: PropTypes.instanceOf(Date),
  scrollToTime: PropTypes.instanceOf(Date),
}

Week.range = (date: Date, p: { localizer: DateLocalizer }) => {
  const start = new Date(2024, 8, 30)
  const end = dates.add(start, 4, 'day')

  let current = start
  const range = []

  while (localizer.lte(current, end, 'day')) {
    range.push(current)
    current = localizer.add(current, 1, 'day')
  }

  return range
}

Week.title = () => "Week"

class CustomToolbar extends Toolbar {
  render() {
    return "";
  }
}

const getTime = (day: number, time: string) => {
  let [hour, minute] = time.split(":");
  if (hour && time.slice(-2) === "PM" && time.slice(0, 2) !== "12") {
    hour = (parseInt(hour) + 12).toString();
  }
  return new Date(2024, 8, 29 + day, parseInt(hour || "0"), parseInt(minute || "0"));
}

const getTimes = (courseID: string, sessionType: string, sessionTimes: Time[], color: string) => {
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
}

interface Event {
  title: string;
  start: Date;
  end: Date;
  color: string;
}

const getEvents = (CourseDetails: Course[], selectedSemester: string, selectedSessions: CourseSessions, hoverSession?: HoverSession) => {
  let events: Event[] = [];

  const filteredCourses = CourseDetails.filter((course) => {
    const schedules = course.schedules;
    if (schedules) {
      return schedules.some(sched => sessionToString(sched) === selectedSemester);
    }
  });

  const selectedLectures = filteredCourses.flatMap(course => {
    const lecture = course.schedules?.find(sched => sessionToString(sched) === selectedSemester)
      ?.lectures.find(lecture => lecture.name === selectedSessions[course.courseID]?.Lecture);
    return {
      courseID: course.courseID,
      color: selectedSessions[course.courseID]?.Color || "",
      ...lecture,
    }
  }).filter(x => x !== undefined);

  events = events.concat(selectedLectures.flatMap(lecture => {
    if (lecture.times) return getTimes(lecture.courseID, lecture.name || "Lecture", lecture.times, lecture.color);
  }).filter(x => x !== undefined));

  const selectedSections = filteredCourses.flatMap(course => {
    const section = course.schedules?.find(sched => sessionToString(sched) === selectedSemester)
      ?.sections.find(section => section.name === selectedSessions[course.courseID]?.Section);
    return {
      courseID: course.courseID,
      color: selectedSessions[course.courseID]?.Color || "",
      ...section,
    }
  }).filter(x => x !== undefined);

  events = events.concat(selectedSections.flatMap(section => {
    if (section.times) return getTimes(section.courseID, `Section ${section.name || ""}`, section.times, section.color);
  }).filter(x => x !== undefined));

  if (hoverSession) {
    const courseID = hoverSession.courseID;
    const selectedCourse = filteredCourses.find(course => course.courseID === courseID);

    const hoverLecture = selectedCourse?.schedules?.find(sched => sessionToString(sched) === selectedSemester)
      ?.lectures.find(lecture => lecture.name === hoverSession["Lecture"]);

    const hoverSection = selectedCourse?.schedules?.find(sched => sessionToString(sched) === selectedSemester)
      ?.sections.find(section => section.name === hoverSession["Section"]);

    const hoverColor = "#9CA3AF";
    if (hoverLecture)
      events.push(...getTimes(courseID, hoverLecture.name || "Lecture", hoverLecture.times, hoverColor));

    if (hoverSection)
      events.push(...getTimes(courseID, `Section ${hoverSection?.name || ""}`, hoverSection?.times, hoverColor));
  }

  return events;
}

interface Props {
  courseIDs: string[];
}

const ScheduleCalendar = ({ courseIDs }: Props) =>{
  const selectedSession = useAppSelector(selectSessionInActiveSchedule);
  const selectedCourseSessions = useAppSelector(selectCourseSessionsInActiveSchedule);
  const hoverSession = useAppSelector(selectHoverSessionInActiveSchedule);

  const CourseDetails = useFetchCourseInfos(courseIDs);

  const events = getEvents(CourseDetails, selectedSession, selectedCourseSessions, hoverSession);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const { defaultDate, views, components, formats, eventPropGetter } = useMemo(
    () => ({
      defaultDate: new Date(2015, 3, 1),
      views: {
        week: Week,
      },
      components: {
        toolbar: CustomToolbar,
        header: ({ date } : { date: Date }) => <div>{days[moment(date).day()]}</div>,
      },
      formats: {
        eventTimeRangeFormat: () => {
          return ""
        },
      },
      eventPropGetter: (event: Event) => ({
          style: {
            color: "#030712",
            backgroundColor: event.color,
          },
        }),
    }), []);

  return (
    <div className="m-6 p-4 bg-white rounded-md">
      <Calendar
        defaultDate={defaultDate}
        defaultView="week"
        events={events}
        localizer={localizer}
        style={style}
        views={views}
        components={components}
        formats={formats}
        eventPropGetter={eventPropGetter}
        min={new Date(0, 0, 0, 8, 0)}
        max={new Date(0, 0, 0, 22, 0)}
      />
    </div>
  )
}

export default ScheduleCalendar;