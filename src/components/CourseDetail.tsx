import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import BookmarkButton from "./BookmarkButton";
import { fetchFCEInfos } from "../app/courses";
import { Tab } from "@headlessui/react";
import {
  approximateHours,
  compareSessions,
  courseListToString,
  displayUnits,
  filterSessions,
  injectLinks,
  sessionToShortString,
  sessionToString,
  timeArrToString,
} from "../app/utils";
import { FCECard } from "./FCEDetail";
import CourseCard from "./CourseCard";

const Lecture = ({ lectureInfo, sections }) => {
  return (
    <>
      <div className="mt-2 flex items-baseline rounded-md px-2 py-2 hover:bg-grey-100 dark:text-grey-200">
        <div className="text-md w-1/12 font-bold">{lectureInfo.name}</div>
        <div className="w-5/12 text-sm">
          {lectureInfo.instructors.join("; ")}
        </div>
        <div className="flex w-6/12 flex-col text-sm">
          {lectureInfo.times.map((time) => (
            <div className="flex">
              <div className="w-2/3">{timeArrToString([time])}</div>
              <div className="w-1/3">
                {time.building} {time.room}
              </div>
            </div>
          ))}
        </div>
      </div>

      {sections.map((section) => (
        <div className="flex items-baseline px-2 py-1 text-grey-600 dark:text-grey-300 hover:bg-grey-100">
          <div className="text-md w-1/12">{section.name}</div>
          <div className="w-5/12 text-sm">{section.instructors.join("; ")}</div>
          <div className="flex w-6/12 flex-col text-sm">
            {section.times.map((time) => (
              <div className="flex">
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
  let scheduleDivs = <></>;

  if (scheduleInfo.lectures.length !== 0) {
    scheduleDivs = scheduleInfo.lectures.map((lecture) => (
      <Lecture
        lectureInfo={lecture}
        sections={scheduleInfo.sections.filter(
          (section) => section.lecture === lecture.name
        )}
      />
    ));
  } else {
    console.log(scheduleInfo.sections);
    scheduleDivs = scheduleInfo.sections.map((section) => (
      <Lecture lectureInfo={section} sections={[]} />
    ));
  }
  return <div className="p-2">{scheduleDivs}</div>;
};

const Schedules = ({ scheduleInfos }) => {
  console.log(scheduleInfos);

  return (
    <div className="w-full">
      <h1 className="text-lg dark:text-white">Schedules</h1>
      <Tab.Group>
        <Tab.List className="mt-2 flex space-x-1 rounded-md bg-grey-100 dark:bg-grey-800 p-2">
          {scheduleInfos.map((scheduleInfo) => {
            const label = sessionToString(scheduleInfo);
            return (
              <Tab
                className={({ selected }) =>
                  "rounded-md px-2 py-1 text-sm hover:bg-white dark:hover:bg-grey-900 dark:text-grey-100 " +
                  (selected ? "bg-white dark:bg-grey-900" : "")
                }
              >
                {label}
              </Tab>
            );
          })}
        </Tab.List>
        <Tab.Panels>
          {scheduleInfos.map((scheduleInfo) => (
            <Tab.Panel>
              <Schedule scheduleInfo={scheduleInfo} />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

const CourseDetail = ({ info }) => {
  const dispatch = useAppDispatch();
  const loggedIn = useAppSelector((state) => state.user.loggedIn);

  useEffect(() => {
    dispatch(fetchFCEInfos({ courseIDs: [info.courseID] }));
  }, [info.courseID, loggedIn]);

  const sortedSchedules = filterSessions([...info.schedules]).sort(
    compareSessions
  );

  const fces = useAppSelector((state) => state.courses.fces[info.courseID]);

  return (
    <div className="m-auto space-y-4 p-6">
      <CourseCard info={info} showFCEs={false} showCourseInfo={true}/>
      {fces && <FCECard fces={fces} />}
      <div className="rounded-md bg-white dark:bg-grey-900 p-6">
        <Schedules scheduleInfos={sortedSchedules} />
      </div>
    </div>
  );
};

export default CourseDetail;
