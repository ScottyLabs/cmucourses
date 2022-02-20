import React, { useEffect, useState } from "react";
import { useSelector, useDispatch, RootStateOrAny } from "react-redux";
import BookmarkButton from "./BookmarkButton";
import StarRatings from 'react-star-ratings';
import { fetchFCEInfos } from "../app/courses";
import { Tab } from "@headlessui/react";
import {
  compareSessions,
  displayUnits,
  sessionToString,
  sessionToShortString,
  courseListToString,
  filterSessions,
  injectLinks,
  timeArrToString,
  approximateHours,
} from "../app/utils";
import { aggregateFCEs } from "../app/fce";

const Lecture = ({ lectureInfo, sections }) => {
  return (
    <>
      <div className="flex items-baseline px-2 py-2 mt-2 rounded-md hover:bg-gray-100">
        <div className="w-1/12 font-bold text-md">{lectureInfo.name}</div>
        <div className="w-5/12 text-sm">
          {lectureInfo.instructors.join("; ")}
        </div>
        <div className="flex flex-col w-6/12 text-sm">
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
        <div className="flex items-baseline px-2 py-1 text-gray-600 hover:bg-gray-100">
          <div className="w-1/12 text-md">{section.name}</div>
          <div className="w-5/12 text-sm">{section.instructors.join("; ")}</div>
          <div className="flex flex-col w-6/12 text-sm">
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
  return <div className="p-2 lg:w-10/12">{scheduleDivs}</div>;
};

const Schedules = ({ scheduleInfos }) => {
  console.log(scheduleInfos);

  return (
    <div className="w-full">
      <h1 className="text-lg">Schedules</h1>
      <Tab.Group>
        <Tab.List className="flex p-2 mt-2 space-x-1 bg-gray-100 rounded-md">
          {scheduleInfos.map((scheduleInfo) => {
            const label = sessionToString(scheduleInfo);
            return (
              <Tab
                className={({ selected }) =>
                  "px-2 py-1 text-sm rounded-md hover:bg-white " +
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
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchFCEInfos({ courseIDs: [info.courseID] }));
  }, [info.courseID]);

  const sortedSchedules = filterSessions([...info.schedules]).sort(
    compareSessions
  );

  const mostRecentSchedules = sortedSchedules.slice(0, 3);
  const schedulesAvailableString = mostRecentSchedules
    .map(sessionToShortString)
    .join(", ");
  const loggedIn = useSelector(
    (state: RootStateOrAny) => state.courses.loggedIn
  );

  const hours: number | undefined = info.fces
    ? approximateHours(info.fces, 2)
    : undefined;

  const fces = useSelector(
    (state: RootStateOrAny) => state.courses.fces[info.courseID]
  );
  let aggregateData;
  if (fces) aggregateData = aggregateFCEs(fces);

  return (
    <div className="w-full p-6 space-y-4">
      <div className="p-6 bg-white rounded-md">
        <div className="flex flex-row flex-1">
          <div className="flex flex-col flex-1">
            <div className="text-zinc-600">
              <div className="text-lg">
                <span className="mr-2 font-semibold">{info.courseID}</span>
                <span className="">{info.name}</span>
              </div>
              <div className="text-sm text-zinc-500">{info.department}</div>
            </div>
            <div className="flex-1 mt-4 text-sm leading-relaxed text-zinc-600">
              {injectLinks(info.desc)}
            </div>
          </div>
          <div className="w-64 text-zinc-600">
            <div className="ml-8 space-y-2">
              <div className="flex flex-row justify-between">
                <div>
                  <div className="text-lg">
                    {displayUnits(info.units)} units
                  </div>
                  {loggedIn && hours && (
                    <div className="text-md text-zinc-500">
                      {hours} hrs/week
                    </div>
                  )}
                </div>
                <div>
                  <BookmarkButton courseID={info.courseID} />
                </div>
              </div>

              <div>{schedulesAvailableString}</div>
              <div>
                <div className="font-semibold">Prerequisites</div>
                <div className="text-md text-zinc-500">
                  {injectLinks(info.prereqString || "None")}
                </div>
              </div>
              <div>
                <div className="font-semibold">Corequisites</div>
                <div className="text-md text-zinc-500">
                  {injectLinks(courseListToString(info.coreqs))}
                </div>
              </div>
              <div>
                <div className="font-semibold">Crosslisted</div>
                <div className="text-md text-zinc-500">
                  {injectLinks(courseListToString(info.crosslisted))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 bg-white rounded-md">
        <Schedules scheduleInfos={sortedSchedules} />
      </div>
      {fces && (
        <div className="p-6 bg-white rounded-md">
          <h1 className="text-lg">FCE Browser</h1>
          <div className="p-4 mt-3 text-gray-700 bg-gray-100 rounded-md text-md">
            <div className="flex items-baseline">
              <h2 className="mb-2 text-md">Aggregate Data</h2>
              <div className="flex-1 ml-2 text-sm">(data from 2 semesters)</div>
              <div className="">
                <input
                  placeholder="No. of Semesters"
                  className="px-2 py-1 text-sm rounded-md"
                ></input>
              </div>
            </div>

            <div className="flex mt-2 space-x-2">
              <div className="flex-1 p-2 bg-white rounded-md">
                <div>
                  <span className="text-xl">{aggregateData.workload}</span>
                  <span className="ml-1 text-md">hrs/wk</span>
                </div>
                <div className="text-sm text-gray-500">Workload</div>
              </div>
              <div className="flex-1 p-2 bg-white rounded-md">
                <div className="flex content-end">
                  <StarRatings rating={aggregateData.teachingRate} starDimension="22px" starSpacing="2px"/>
                  <span className="ml-2 text-xl">{aggregateData.teachingRate}</span>
                </div>
                <div className="text-sm text-gray-500">Teaching Rate</div>
              </div>
              <div className="flex-1 p-2 bg-white rounded-md">
              <div className="flex content-end">
                  <StarRatings rating={aggregateData.courseRate} starDimension="22px" starSpacing="2px"/>
                  <span className="ml-2 text-xl">{aggregateData.courseRate}</span>
                </div>
                <div className="text-sm text-gray-500">Course Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
