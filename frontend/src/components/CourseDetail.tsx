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
      <div className="text-gray-700 mt-2 flex items-baseline rounded-md px-2 py-2 hover:bg-gray-50">
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
          className="text-gray-600 flex items-baseline px-2 py-1 hover:bg-gray-50"
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
      <h1 className="text-gray-700 text-lg">Schedules</h1>
      <Tab.Group>
        <Tab.List className="bg-gray-50 mt-2 flex space-x-1 rounded-md p-2">
          {scheduleInfos.map((scheduleInfo) => {
            const label = sessionToString(scheduleInfo);
            return (
              <Tab
                key={label}
                className={({ selected }) =>
                  "text-gray-800 rounded-md px-2 py-1 text-sm hover:bg-white " +
                  (selected ? "bg-white" : "")
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
        <div className="bg-white rounded-md p-6">
          <Schedules scheduleInfos={sortedSchedules} />
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
