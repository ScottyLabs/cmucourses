import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchFCEInfos } from "../app/courses";
import { Tab } from "@headlessui/react";
import {
  compareSessions,
  filterSessions,
  sessionToString,
  timeArrToString,
} from "../app/utils";
import { FCECard } from "./FCEDetail";
import CourseCard from "./CourseCard";

const Lecture = ({ lectureInfo, sections }) => {
  return (
    <>
      <div className="mt-2 flex items-baseline rounded-md px-2 py-2 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800">
        <div className="text-md w-1/12 font-bold">{lectureInfo.name}</div>
        <div className="w-5/12 text-sm">
          {lectureInfo.instructors.join("; ")}
        </div>
        <div className="flex w-6/12 flex-col text-sm">
          {lectureInfo.times.map((time) => (
            <div className="flex" key={timeArrToString([time])}>
              <div className="w-2/3">{timeArrToString([time])}</div>
              <div className="w-1/3">
                {time.building} {time.room}
              </div>
            </div>
          ))}
        </div>
      </div>

      {sections.map((section) => (
        <div
          className="flex items-baseline px-2 py-1 text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
          key={section.name}
        >
          <div className="text-md w-1/12">{section.name}</div>
          <div className="w-5/12 text-sm">{section.instructors.join("; ")}</div>
          <div className="flex w-6/12 flex-col text-sm">
            {section.times.map((time) => (
              <div className="flex" key={timeArrToString([time])}>
                <div className="w-2/3">{timeArrToString([time])}</div>
                <div className="w-1/3">
                  {time.building} {time.room}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

const Schedule = ({ scheduleInfo }) => {
  let scheduleDivs;

  if (scheduleInfo.lectures.length !== 0) {
    scheduleDivs = scheduleInfo.lectures.map((lecture) => (
      <Lecture
        key={lecture.name}
        lectureInfo={lecture}
        sections={scheduleInfo.sections.filter(
          (section) => section.lecture === lecture.name
        )}
      />
    ));
  } else {
    scheduleDivs = scheduleInfo.sections.map((section) => (
      <Lecture lectureInfo={section} sections={[]} key={section.name} />
    ));
  }
  return <div className="p-2">{scheduleDivs}</div>;
};

const Schedules = ({ scheduleInfos }) => {
  return (
    <div className="w-full">
      <h1 className="text-lg text-gray-800 dark:text-gray-50">Schedules</h1>
      <Tab.Group>
        <Tab.List className="mt-2 flex space-x-1 rounded-md bg-gray-50 p-2 dark:bg-gray-800">
          {scheduleInfos.map((scheduleInfo) => {
            const label = sessionToString(scheduleInfo);
            return (
              <Tab
                key={label}
                className={({ selected }) =>
                  "rounded-md px-2 py-1 text-sm hover:bg-white dark:text-gray-100 dark:hover:bg-gray-900 " +
                  (selected ? "bg-white dark:bg-gray-900" : "")
                }
              >
                {label}
              </Tab>
            );
          })}
        </Tab.List>
        <Tab.Panels>
          {scheduleInfos.map((scheduleInfo) => (
            <Tab.Panel key={sessionToString(scheduleInfo)}>
              <Schedule scheduleInfo={scheduleInfo} />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

const CourseDetail = ({ info, schedules }) => {
  const dispatch = useAppDispatch();
  const loggedIn = useAppSelector((state) => state.user.loggedIn);

  useEffect(() => {
    dispatch(fetchFCEInfos({ courseIDs: [info.courseID] }));
  }, [info.courseID, loggedIn]);

  let sortedSchedules;
  if (schedules)
    sortedSchedules = filterSessions([...schedules]).sort(compareSessions);

  const fces = useAppSelector((state) => state.courses.fces[info.courseID]);

  return (
    <div className="m-auto space-y-4 p-6">
      <CourseCard info={info} showFCEs={false} showCourseInfo={true} />
      {fces && <FCECard fces={fces} />}
      {schedules && (
        <div className="rounded-md bg-white p-6 dark:bg-gray-900">
          <Schedules scheduleInfos={sortedSchedules} />
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
