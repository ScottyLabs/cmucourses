import { sessionToString, timeArrToString } from "../app/utils";
import React from "react";
import { Tab } from "@headlessui/react";
import { Lecture, Schedule, Section } from "../app/types";

const Lecture = ({
  lectureInfo,
  sections,
}: {
  lectureInfo: Lecture;
  sections: Section[];
}) => {
  return (
    <>
      <div className="text-gray-700 mt-2 flex items-baseline rounded px-2 py-2 hover:bg-gray-50">
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
  return <div className="p-2">{scheduleDivs}</div>;
};

export const Schedules = ({ scheduleInfos }: { scheduleInfos: Schedule[] }) => {
  return (
    <div className="w-full">
      <h1 className="text-gray-700 text-lg">Schedules</h1>
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
    </div>
  );
};
