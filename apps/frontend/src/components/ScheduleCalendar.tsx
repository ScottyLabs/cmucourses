import React, { useMemo } from "react";
import { Calendar, DateLocalizer, momentLocalizer } from "react-big-calendar";
import PropTypes from 'prop-types'
import * as dates from 'date-arithmetic'
import TimeGrid from 'react-big-calendar/lib/TimeGrid'
import Toolbar from 'react-big-calendar/lib/Toolbar'
import style from "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import useDeepCompareEffect from "use-deep-compare-effect";
import { fetchCourseInfos } from "~/app/api/course";
import { fetchFCEInfosByCourse } from "~/app/api/fce";
import { selectCourseResults } from "~/app/cache";
import { Course } from "~/app/types";
import {sessionToString} from "~/app/utils";

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

interface courseSessions {
  [courseID: string]: {
    [sessionType: string]: string;
  };
}

const getTimes = (courseID: string, sessionType: string, sessionTimes) => {
  const times = [];
  for (const sessionTime of sessionTimes || []) {
    for (const day of sessionTime.days || []) {
      times.push({
        title: `${courseID} ${sessionType}`,
        start: getTime(day, sessionTime.begin || ""),
        end: getTime(day, sessionTime.end || ""),
      });
    }
  }
  return times;
}

interface Event {
  title: string;
  start: Date;
  end: Date;
}

const getEvents = (CourseDetails: Course[], selectedSemester: string, selectedSessions: courseSessions) => {
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
      ...lecture,
    }
  }).filter(x => x !== undefined);

  events = events.concat(selectedLectures.flatMap(lecture => getTimes(lecture.courseID, lecture.name || "Lecture", lecture.times)));

  const selectedSections = filteredCourses.flatMap(course => {
    const section = course.schedules?.find(sched => sessionToString(sched) === selectedSemester)
      ?.sections.find(section => section.name === selectedSessions[course.courseID]?.Section);
    return {
      courseID: course.courseID,
      ...section,
    }
  }).filter(x => x !== undefined);

  events = events.concat(selectedSections.flatMap(section => getTimes(section.courseID, `Section ${section.name || ""}`, section.times)));

  console.log(events)

  return events;
}

interface Props {
  courseIDs: string[];
}

const ScheduleCalendar = ({ courseIDs }: Props) =>{
  const loggedIn = useAppSelector((state) => state.user.loggedIn);
  const selectedSemester = useAppSelector((state) => state.user.selectedSemester);
  const selectedSessions = useAppSelector((state) => state.user.selectedSessions);
  const dispatch = useAppDispatch();

  useDeepCompareEffect(() => {
    if (courseIDs) {
      void dispatch(fetchCourseInfos(courseIDs));
      if (loggedIn) void dispatch(fetchFCEInfosByCourse({ courseIDs }));
    }
  }, [courseIDs]);

  const CourseDetails = useAppSelector(selectCourseResults(courseIDs)).filter(x => x !== undefined);

  const events = getEvents(CourseDetails, selectedSemester, selectedSessions);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const { defaultDate, views, components, formats } = useMemo(
    () => ({
      defaultDate: new Date(2015, 3, 1),
      views: {
        week: Week,
      },
      components: {
        toolbar: CustomToolbar,
        header: ({ date } : { date: Date }) => <span>{days[moment(date).day()]}</span>,
      },
      formats: {
        eventTimeRangeFormat: () => {
          return ""
        },
      },
    }),
    []
  )

  return (
    <div className="m-2 p-4 bg-white rounded-md">
      <Calendar
        defaultDate={defaultDate}
        defaultView="week"
        events={events}
        localizer={localizer}
        style={style}
        views={views}
        components={components}
        formats={formats}
        min={new Date(0, 0, 0, 8, 0)}
        max={new Date(0, 0, 0, 22, 0)}
      />
    </div>
  )
}

export default ScheduleCalendar;