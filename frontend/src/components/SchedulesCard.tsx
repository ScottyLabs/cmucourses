import { sessionToString, timeArrToString } from "../app/utils";
import React from "react";
import { Tab } from "@headlessui/react";
import { Lecture, Schedule, Section } from "../app/types";
import { Card } from "./Card";
import Link from "./Link";


const Lecture = ({
  lectureInfo,
  sections,
}: {
  lectureInfo: Lecture;
  sections: Section[];
}) => {
  return (
    <>
      <div className="text-gray-700 contents rounded hover:bg-gray-50">
        <div className="text-md col-span-1 pt-2 font-bold">
          {lectureInfo.name}
        </div>
        <div className="col-span-1 text-sm">
          {/* {lectureInfo.instructors.join("; ")} */}
          {lectureInfo.instructors.map((instructor, i) => {
            if (instructor !== "TBA") {
              return (
                <p>
                  <Link href={`/instructor/${instructor.toUpperCase()}`}>
                    {instructor}
                  </Link>
                </p>
              )
            } else {
              return (
                <p>
                  {instructor}
                </p>
              )
            }
          })}
        </div>
        <div className="contents flex-col text-sm">
          {lectureInfo.times.map((time) => (
            <div className="contents" key={timeArrToString([time])}>
              <div className="col-span-1 col-start-3">
                {timeArrToString([time])}
              </div>
              <div className="col-span-1">
                {time.building} {time.room}
              </div>
            </div>
          ))}
        </div>
      </div>

      {sections.map((section) => (
        <div
          className="text-gray-600 contents hover:bg-gray-50"
          key={section.name}
        >
          <div className="text-md col-span-1 pt-1">{section.name}</div>
          <div className="col-span-1 text-sm">
            {/* {section.instructors.join("; ")} */}
            {lectureInfo.instructors.map((instructor, i) => {
              if (instructor !== "TBA") {
                return (
                  <p>
                    <Link href={`/instructor/${instructor.toUpperCase()}`}>
                      {instructor}
                    </Link>
                  </p>
                )
              } else {
                return (
                  <p>
                    {instructor}
                  </p>
                )
              }
            })}
          </div>
          <div className="contents text-sm">
            {section.times.map((time) => (
              <div className="contents" key={timeArrToString([time])}>
                <div className="col-span-1 col-start-3">
                  {timeArrToString([time])}
                </div>
                <div className="col-span-1">
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

const Schedule = ({ scheduleInfo }: { scheduleInfo: Schedule }) => {
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
  return (
    <div className="grid grid-cols-[auto_auto_auto_auto] items-baseline gap-x-4 overflow-x-auto whitespace-nowrap p-2">
      {scheduleDivs}
    </div>
  );
};

export const SchedulesCard = ({
  scheduleInfos,
}: {
  scheduleInfos: Schedule[];
}) => {
  return (
    <Card>
      <Card.Header>Schedules</Card.Header>
      <Tab.Group>
        <Tab.List className="bg-gray-50 mt-2 space-x-1 overflow-x-auto whitespace-nowrap rounded p-2">
          {scheduleInfos.map((scheduleInfo) => {
            const label = sessionToString(scheduleInfo);
            return (
              <Tab
                key={label}
                className={({ selected }) =>
                  "text-gray-800 inline-block rounded px-2 py-1 text-sm hover:bg-white " +
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
    </Card>
  );
};
