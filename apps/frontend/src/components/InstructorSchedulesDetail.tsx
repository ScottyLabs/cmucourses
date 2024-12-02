import React from "react";
import { Tab } from "@headlessui/react";
import Link from "./Link";
import { compareSessions, stringToSession } from "~/app/utils";
import { useFetchCourseInfos } from "~/app/api/course";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Course } from "~/app/types";
import { getTable } from "~/components/GetTable";
import { getTooltip } from "~/components/GetTooltip";

const columns: ColumnDef<Course>[] = [
  {
    header: "Course",
    accessorKey: "courseID",
    cell: (info) => {
      const courseID = info.getValue() as string;
      const id = `instructor-schedules-detail-${courseID}`;
      return (
        <>
          <Link href={`/course/${courseID}`} data-tooltip-id={id}>
            {courseID}
          </Link>
          {getTooltip(id, info.row.original.desc as string)}
        </>
      )
    },
  },
  {
    header: "Course Name",
    accessorKey: "name",
    cell: (info) => {
      const name = info.getValue() as string;
      const id = `instructor-schedules-detail-${name}`;
      if (name) {
        return (
          <>
            <Link href={`/course/${info.row.original.courseID as string}`} data-tooltip-id={id} >
              <span className="text-wrap">{name}</span>
            </Link>
            {getTooltip(id, info.row.original.desc as string)}
          </>
        )
      }
      return <p>-</p>
    },
  },
  {
    header: "Units",
    accessorKey: "units",
  },
];

const ScheduleViewer = ({ courseIDs }: { courseIDs: string[] }) => {
  const data = useFetchCourseInfos(courseIDs);

  if (!data) return null;

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-3">
      {getTable(table)}
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
