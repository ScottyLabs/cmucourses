import React from "react";
import { aggregateFCEs, filterFCEs } from "../app/fce";
import StarRatings from "react-star-ratings";
import { useTable } from "react-table";
import { FCE } from "../app/types";
import { sessionToString } from "../app/utils";
import { useAppSelector } from "../app/hooks";

import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config.js";

const fullConfig = resolveConfig(tailwindConfig);

const FCETable = ({ columns, data }) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  return (
    <table {...getTableProps()} className="w-full min-w-fit table-auto">
      <thead>
        {headerGroups.map((headerGroup, idx) => (
          <tr {...headerGroup.getHeaderGroupProps()} key={idx}>
            {headerGroup.headers.map((column, idx) => (
              <th
                className="whitespace-nowrap px-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-100"
                key={idx}
                {...column.getHeaderProps()}
              >
                {column.render("Header")}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, idx) => {
          prepareRow(row);
          return (
            <tr
              key={idx}
              {...row.getRowProps()}
              className="hover:bg-white dark:hover:bg-gray-700"
            >
              {row.cells.map((cell, idx) => {
                return (
                  <td
                    className="whitespace-nowrap px-2 text-sm text-gray-600 dark:text-gray-200"
                    key={idx}
                    {...cell.getCellProps()}
                  >
                    {cell.render("Cell")}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const convertFCEData = (fces: FCE[]) => {
  return fces.map((fce) => ({
    ...fce,
    semesterStr: sessionToString(fce),
    teachingRate: fce.rating[7],
    courseRate: fce.rating[8],
  }));
};

const columns = [
  {
    Header: "Semester",
    accessor: "semesterStr",
  },
  {
    Header: "Instructor",
    accessor: "instructor",
  },
  {
    Header: "Workload",
    accessor: "hrsPerWeek",
  },
  {
    Header: "Teaching",
    accessor: "teachingRate",
  },
  {
    Header: "Course Rate",
    accessor: "courseRate",
  },
  {
    Header: "Respondents",
    accessor: "numRespondents",
  },
  {
    Header: "Response Rate",
    accessor: "responseRate",
  },
];

export const FCEDetail = ({ fces }) => {
  const aggregationOptions = useAppSelector(
    (state) => state.user.fceAggregation
  );
  const darkMode = useAppSelector((state) => state.user.darkMode);

  let aggregateData: any = {};
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
      <div className="text-md mt-3 rounded-md bg-gray-50 p-4 text-gray-700 dark:bg-gray-800 dark:text-gray-100">
        <div className="flex items-baseline">
          <h2 className="text-md mb-2">Aggregate Data</h2>
          <div className="ml-2 flex-1 text-sm">
            (data from {aggregateData.semestersCounted} semesters)
          </div>
        </div>

        <div className="mt-2 flex space-x-2">
          <div className="w-1/5 flex-1 rounded-md bg-white p-2 dark:bg-gray-700">
            <div>
              <span className="text-xl">{aggregateData.workload}</span>
              <span className="text-md ml-1">hrs/wk</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-200">
              Workload
            </div>
          </div>
          <div className="flex-1 rounded-md bg-white p-2 dark:bg-gray-700">
            <div className="flex content-end">
              <div className="hidden lg:block">
                <StarRatings
                  rating={aggregateData.teachingRate}
                  starDimension="20px"
                  starSpacing="1px"
                  starRatedColor={
                    darkMode
                      ? fullConfig.theme.colors.gray[50]
                      : fullConfig.theme.colors.gray[500]
                  }
                  starEmptyColor={
                    darkMode
                      ? fullConfig.theme.colors.gray[500]
                      : fullConfig.theme.colors.gray[200]
                  }
                />
              </div>
              <span className="text-xl lg:ml-2">
                {aggregateData.teachingRate}
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-200">
              Teaching Rate
            </div>
          </div>
          <div className="flex-1 rounded-md bg-white p-2 dark:bg-gray-700">
            <div className="flex content-end">
              <div className="hidden lg:block">
                <StarRatings
                  rating={aggregateData.courseRate}
                  starDimension="20px"
                  starSpacing="1px"
                  starRatedColor={
                    darkMode
                      ? fullConfig.theme.colors.gray[50]
                      : fullConfig.theme.colors.gray[500]
                  }
                  starEmptyColor={
                    darkMode
                      ? fullConfig.theme.colors.gray[500]
                      : fullConfig.theme.colors.gray[200]
                  }
                />
              </div>
              <span className="text-xl lg:ml-2">
                {aggregateData.courseRate}
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-200">
              Course Rate
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 overflow-x-auto rounded-md bg-gray-50 p-4 dark:bg-gray-800">
        <FCETable columns={columns} data={convertFCEData(filteredFCEs)} />
      </div>
    </>
  );
};

export const FCECard = ({ fces }) => {
  return (
    <div className="rounded-md bg-white p-6 dark:bg-gray-900">
      <h1 className="text-lg dark:text-white">FCE Browser</h1>
      <FCEDetail fces={fces} />
    </div>
  );
};
