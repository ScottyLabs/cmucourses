import React from "react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FCE } from "../app/types";
import { sessionToString } from "../app/utils";
import Link from "./Link";
import { FCETable } from "./FCETable";

const columns: ColumnDef<FCEDetailRow>[] = [
  {
    header: "Semester",
    accessorKey: "semesterStr",
  },
  {
    header: "Course",
    accessorKey: "courseID",
    cell: (info) => {
      const courseID = info.getValue() as string;
      return <Link href={`/course/${courseID}`}>{courseID}</Link>;
    },
  },
  {
    header: "Workload",
    accessorKey: "hrsPerWeek",
  },
  {
    header: "Teaching",
    accessorKey: "teachingRate",
  },
  {
    header: "Course Rate",
    accessorKey: "courseRate",
  },
  {
    header: "Respondents",
    accessorKey: "numRespondents",
  },
  {
    header: "Response Rate",
    accessorKey: "responseRate",
  },
];

const InstructorFCETable = ({
  columns,
  data,
}: {
  columns: ColumnDef<FCEDetailRow>[];
  data: FCEDetailRow[];
}) => {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="w-full min-w-fit table-auto">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                className="text-gray-700 whitespace-nowrap px-2 text-left text-sm font-semibold"
                key={header.id}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="hover:bg-white">
            {row.getVisibleCells().map((cell) => (
              <td
                className="text-gray-600 whitespace-nowrap px-2 text-sm"
                key={cell.id}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

type FCEDetailRow = ReturnType<typeof convertFCEData>[0];

const convertFCEData = (fces: FCE[]) => {
  return fces.map((fce) => ({
    ...fce,
    semesterStr: sessionToString(fce),
    teachingRate: fce.rating[7],
    courseRate: fce.rating[8],
  }));
};

export const InstructorFCEDetail = ({ fces }: { fces: FCE[] }) => {
  const aggregationOptions = {
    numSemesters: 10,
    counted: { spring: true, summer: true, fall: true },
  };

  return (
    <FCETable
      fces={fces}
      columnVisibility={{ instructor: false }}
      aggregationOptions={aggregationOptions}
    />
  );
};
