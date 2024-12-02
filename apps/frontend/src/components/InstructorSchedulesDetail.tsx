import React from "react";
import { Tab } from "@headlessui/react";
import Link from "./Link";
import {compareSessions, stringToSession} from "~/app/utils";

const ScheduleViewer = ({ courseIDs }: { courseIDs: string[] }) => {
  return (
    <div className="p-2">
      <div className="flex text-gray-700 text-sm">
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
  scheduleInfos,
}: {
  scheduleInfos: ScheduleInfos;
}) => {
  const sessions = Object.keys(scheduleInfos).sort((a, b) => {
    return compareSessions(stringToSession(a), stringToSession(b));
  });

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
            <ScheduleViewer courseIDs={scheduleInfos[session] || []} />
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};
