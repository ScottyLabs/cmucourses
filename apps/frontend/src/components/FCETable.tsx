import React from "react";
import {
  AggregatedFCEs,
  aggregateFCEs,
  AggregateFCEsOptions,
  filterFCEs,
} from "~/app/fce";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FCE } from "~/app/types";
import { sessionToString, responseRateZero } from "~/app/utils";
import { StarRating } from "./StarRating";
import Link from "./Link";

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
                className="whitespace-nowrap px-2 text-left text-sm font-semibold text-gray-700"
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

type FCEDetailRow = ReturnType<typeof convertFCEData>[0];

const convertFCEData = (fces: FCE[]) => {
  return fces.map((fce) => {
    if (responseRateZero(fce)) {
      // If response rate is 0, then the no data
      return {
        ...fce,
        responseRate: "0%",
        semesterStr: sessionToString(fce),
        teachingRate: "N/A",
        courseRate: "N/A",
        hrsPerWeek: "N/A",
      };
    }
    return {
      ...fce,
      responseRate:
        fce.responseRate.slice(-1) === "%"
          ? fce.responseRate
          : `${fce.responseRate}%`,
      semesterStr: sessionToString(fce),
      teachingRate: fce.rating[7],
      courseRate: fce.rating[8],
    };
  });
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
  let aggregateData: AggregatedFCEs | undefined = undefined;
  let filteredFCEs = fces;

  if (fces) {
    filteredFCEs = filterFCEs(fces, aggregationOptions);
    aggregateData = aggregateFCEs(filteredFCEs);
  }

  if (!fces || fces.length == 0) {
    return <></>;
  }

  return (
    <>
      {aggregateData && aggregateData.fcesCounted !== 0 && (
        <div className="text-md mt-3 rounded p-4 text-gray-700 bg-gray-50">
          <div className="flex items-baseline">
            <h2 className="text-md mb-2">Aggregate Data</h2>
            <div className="ml-2 flex-1 text-sm">
              (data from {aggregateData.semestersCounted} semesters)
            </div>
          </div>

          <div className="mt-2 flex space-x-2">
            <div className="w-1/5 flex-1 rounded p-2 bg-white">
              <div>
                <span className="text-xl">{aggregateData.workload}</span>
                <span className="text-md ml-1 hidden sm:inline">hrs/wk</span>
              </div>
              <div className="text-sm text-gray-500">Workload</div>
            </div>
            <div className="flex-1 rounded p-2 bg-white">
              <div className="flex content-end">
                <div className="hidden lg:block">
                  <StarRating rating={Number(aggregateData.teachingRate)} />
                </div>
                <span className="text-xl lg:ml-2">
                  {aggregateData.teachingRate}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Teaching <span className="hidden sm:inline">Rate</span>
              </div>
            </div>
            <div className="flex-1 rounded p-2 bg-white">
              <div className="flex content-end">
                <div className="hidden lg:block">
                  <StarRating rating={Number(aggregateData.courseRate)} />
                </div>
                <span className="text-xl lg:ml-2">
                  {aggregateData.courseRate}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Course <span className="hidden sm:inline">Rate</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="mt-3 overflow-x-auto rounded p-4 bg-gray-50">
        <FCEDataTable
          columns={columns}
          data={convertFCEData(filteredFCEs)}
          columnVisibility={columnVisibility}
        />
      </div>
    </>
  );
};