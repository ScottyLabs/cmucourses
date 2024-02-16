import React from "react";
import {
  AggregatedFCEs,
  aggregateFCEs,
  AggregateFCEsOptions,
  filterFCEs,
} from "../app/fce";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FCE } from "../app/types";
import { sessionToString } from "../app/utils";
import { StarRating } from "./StarRating";
import Link from "./Link";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

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
    header: "Instructor",
    accessorKey: "instructor",
    cell: (info) => {
      const instructor = info.getValue() as string;
      return <Link href={`/instructor/${instructor}`}>{instructor}</Link>;
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

export const FCEDataTable = ({
  columns,
  data,
  columnVisibility,
}: {
  columns: ColumnDef<FCEDetailRow>[];
  data: FCEDetailRow[];
  columnVisibility: Record<string, boolean>;
}) => {
  const table = useReactTable({
    columns,
    data,
    state: { columnVisibility },
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

export const FCETable = ({
  fces,
  columnVisibility,
  aggregationOptions,
}: {
  fces: FCE[];
  columnVisibility: Record<string, boolean>;
  aggregationOptions: AggregateFCEsOptions;
}) => {
  let aggregateData: AggregatedFCEs;
  let filteredFCEs = fces;

  if (fces) {
    filteredFCEs = filterFCEs(fces, aggregationOptions);
    aggregateData = aggregateFCEs(filteredFCEs);
  }

  if (!fces || aggregateData.fcesCounted == 0) {
    return (
      <div className="group flex flex-row items-center mt-2">
      <div className="flex">
        <ExclamationTriangleIcon
          className={`h-5 w-5 stroke-gray-500 dark:stroke-zinc-400`}
        />
      </div>
      <div
        className={`text-gray-600 text-sm ml-2 lg:text-md`}
      >
        {"No FCEs available for the selected settings"}
      </div>
    </div>
    );
  }

  return (
    <>
      <div className="text-md text-gray-700 bg-gray-50 mt-3 rounded p-4">
        <div className="flex items-baseline">
          <h2 className="text-md mb-2">Aggregate Data</h2>
          <div className="ml-2 flex-1 text-sm">
            (data from {aggregateData.semestersCounted} semesters)
          </div>
        </div>

        <div className="mt-2 flex space-x-2">
          <div className="bg-white w-1/5 flex-1 rounded p-2">
            <div>
              <span className="text-xl">{aggregateData.workload}</span>
              <span className="text-md ml-1 hidden sm:inline">hrs/wk</span>
            </div>
            <div className="text-gray-500 text-sm">Workload</div>
          </div>
          <div className="bg-white flex-1 rounded p-2">
            <div className="flex content-end">
              <div className="hidden lg:block">
                <StarRating rating={aggregateData.teachingRate} />
              </div>
              <span className="text-xl lg:ml-2">
                {aggregateData.teachingRate}
              </span>
            </div>
            <div className="text-gray-500 text-sm">
              Teaching <span className="hidden sm:inline">Rate</span>
            </div>
          </div>
          <div className="bg-white flex-1 rounded p-2">
            <div className="flex content-end">
              <div className="hidden lg:block">
                <StarRating rating={aggregateData.courseRate} />
              </div>
              <span className="text-xl lg:ml-2">
                {aggregateData.courseRate}
              </span>
            </div>
            <div className="text-gray-500 text-sm">
              Course <span className="hidden sm:inline">Rate</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 mt-3 overflow-x-auto rounded p-4">
        <FCEDataTable
          columns={columns}
          data={convertFCEData(filteredFCEs)}
          columnVisibility={columnVisibility}
        />
      </div>
    </>
  );
};
