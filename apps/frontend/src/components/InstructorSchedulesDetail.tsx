import React from "react";
import { Tab } from "@headlessui/react";
import Link from "./Link";

const ScheduleViewer = ({ name, courseIDs }: { name: string; courseIDs: string[] }) => {
  return (
    <div className="p-2">
      <div className="flex text-gray-700 text-sm">
        {name.toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")} is teaching:
        &nbsp;
        {courseIDs.map((courseID, i) => (
          <div className="pr-1" key={courseID}>
            <Link href={`/course/${courseID}`}>
              {courseID}{i !== courseIDs.length - 1 ? `,` : ""}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ScheduleInfos {
  [session: string]: string[];
}

export const InstructorSchedulesDetail = ({
  name,
  scheduleInfos,
}: {
  name: string;
  scheduleInfos: ScheduleInfos;
}) => {
  const sessions = Object.keys(scheduleInfos);

  return (
    <Tab.Group>
      <Tab.List className="mt-2 space-x-1 overflow-x-auto whitespace-nowrap rounded p-2 bg-gray-50">
        {sessions.map((session) => {
          return (
            <Tab
              key={session}
              className={({ selected }) =>
                "inline-block rounded px-2 py-1 text-sm text-gray-800 hover:bg-white " +
                (selected ? "bg-white" : "")
              }
            >
              {session}
            </Tab>
          );
        })}
      </Tab.List>
      <Tab.Panels>
        {sessions.map((session) => (
          <Tab.Panel key={session}>
            <ScheduleViewer name={name} courseIDs={scheduleInfos[session] || []} />
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};
