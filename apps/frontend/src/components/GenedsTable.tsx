import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import Link from "./Link";
import { aggregateFCEs } from "~/app/fce";

const columns: ColumnDef<FCEDetailRow>[] = [
  {
    header: "Course",
    accessorKey: "courseID",
    cell: (info) => {
      const courseID = info.getValue() as string;
      return <Link href={`/course/${courseID}`}>{courseID}</Link>;
    },
  },
  {
    header: "Course Name",
    accessorKey: "name",
  },
  {
    header: "Last Instructor",
    accessorKey: "lastInstructor",
    cell: (info) => {
      const instructor = info.getValue() as string;
      return <Link href={`/instructor/${instructor}`}>{instructor}</Link>;
    },
  },
  {
    header: "Units",
    accessorKey: "units",
  },
  {
    header: "Workload",
    accessorKey: "workload",
  },
  {
    header: "Teaching",
    accessorKey: "teachingRate",
  },
  {
    header: "Course Rate",
    accessorKey: "courseRate",
  },
];

export const GenedsTable = ({
  data,
}: {
  data: FCEDetailRow[];
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <table className="w-full min-w-fit table-auto">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                className="whitespace-nowrap px-2 text-left text-sm font-semibold text-gray-700"
                key={header.id}
                onClick={header.column.getToggleSortingHandler()}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
                {{
                  asc: " ⏶",
                  desc: " ⏷",
                }[header.column.getIsSorted() as string] ?? null}
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
                className="whitespace-nowrap px-2 text-sm text-gray-600"
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

type FCEDetailRow = ReturnType<typeof aggregateFCEs>;