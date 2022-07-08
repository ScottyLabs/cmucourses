import React from "react";
import { AggregatedFCEs, aggregateFCEs, filterFCEs } from "../app/fce";
import StarRatings from "react-star-ratings";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FCE } from "../app/types";
import { sessionToString } from "../app/utils";
import { useAppSelector } from "../app/hooks";

import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config.js";

/* eslint-disable-next-line */
const fullConfig: any = resolveConfig(tailwindConfig);

const columns: ColumnDef<FCEDetailRow>[] = [
  {
    header: "Semester",
    accessorKey: "semesterStr",
  },
  {
    header: "Instructor",
    accessorKey: "instructor",
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

const FCETable = ({
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

const StarRating = ({ rating }: { rating: number }) => {
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  /* eslint-disable */
  return (
    <StarRatings
      rating={rating}
      starDimension="20px"
      starSpacing="1px"
      starRatedColor={
        darkMode
          ? fullConfig.theme.colors.zinc[50]
          : fullConfig.theme.colors.gray[500]
      }
      starEmptyColor={
        darkMode
          ? fullConfig.theme.colors.zinc[500]
          : fullConfig.theme.colors.gray[200]
      }
    />
  );
  /* eslint-enable */
};

export const FCEDetail = ({ fces }: { fces: FCE[] }) => {
  const aggregationOptions = useAppSelector(
    (state) => state.user.fceAggregation
  );

  let aggregateData: AggregatedFCEs;
  let filteredFCEs = fces;

  if (fces) {
    filteredFCEs = filterFCEs(fces, aggregationOptions);
    aggregateData = aggregateFCEs(filteredFCEs);
  }

  if (!fces || aggregateData.fcesCounted == 0) {
    return <></>;
  }

  return (
    <>
      <div className="text-md text-gray-700 bg-gray-50 mt-3 rounded-md p-4">
        <div className="flex items-baseline">
          <h2 className="text-md mb-2">Aggregate Data</h2>
          <div className="ml-2 flex-1 text-sm">
            (data from {aggregateData.semestersCounted} semesters)
          </div>
        </div>

        <div className="mt-2 flex space-x-2">
          <div className="bg-white w-1/5 flex-1 rounded-md p-2">
            <div>
              <span className="text-xl">{aggregateData.workload}</span>
              <span className="text-md ml-1 hidden sm:inline">hrs/wk</span>
            </div>
            <div className="text-gray-500 text-sm">Workload</div>
          </div>
          <div className="bg-white flex-1 rounded-md p-2">
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
          <div className="bg-white flex-1 rounded-md p-2">
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
      <div className="bg-gray-50 mt-3 overflow-x-auto rounded-md p-4">
        <FCETable columns={columns} data={convertFCEData(filteredFCEs)} />
      </div>
    </>
  );
};

export const FCECard = ({ fces }: { fces: FCE[] }) => {
  return (
    <div className="bg-white rounded-md p-6 drop-shadow">
      <h1 className="text-gray-700 text-lg">FCE Browser</h1>
      <FCEDetail fces={fces} />
    </div>
  );
};
