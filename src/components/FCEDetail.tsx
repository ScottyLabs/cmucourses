import React, { useState } from "react";
import { aggregateFCEs, filterFCEs } from "../app/fce";
import StarRatings from "react-star-ratings";
import { useTable } from "react-table";
import { FCE } from "../app/types";
import { sessionToString } from "../app/utils";
import { useAppSelector } from "../app/hooks";

import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config.js';
const fullConfig = resolveConfig(tailwindConfig);

const FCETable = ({ columns, data }) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  return (
    <table {...getTableProps()} className="w-full table-auto min-w-fit">
      <thead>
      {headerGroups.map((headerGroup) => (
        <tr {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map((column) => (
            <th
              className="px-2 text-sm font-semibold text-left text-grey-700 dark:text-grey-100 whitespace-nowrap"
              {...column.getHeaderProps()}
            >
              {column.render("Header")}
            </th>
          ))}
        </tr>
      ))}
      </thead>
      <tbody {...getTableBodyProps()}>
      {rows.map((row, i) => {
        prepareRow(row);
        return (
          <tr {...row.getRowProps()} className="hover:bg-white dark:hover:bg-grey-700">
            {row.cells.map((cell) => {
              return (
                <td
                  className="px-2 text-sm text-grey-600 dark:text-grey-200 whitespace-nowrap"
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
  const aggregationOptions = useAppSelector(state => state.user.fceAggregation);
  const darkMode = useAppSelector(state => state.user.darkMode);

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
      <div className="p-4 mt-3 text-grey-700 bg-grey-50 dark:bg-grey-800 dark:text-grey-100 rounded-md text-md">
        <div className="flex items-baseline">
          <h2 className="mb-2 text-md">Aggregate Data</h2>
          <div className="flex-1 ml-2 text-sm">
            (data from {aggregateData.semestersCounted} semesters)
          </div>
        </div>

        <div className="flex mt-2 space-x-2">
          <div className="flex-1 w-1/5 p-2 bg-white dark:bg-grey-700 rounded-md">
            <div>
              <span className="text-xl">{aggregateData.workload}</span>
              <span className="ml-1 text-md">hrs/wk</span>
            </div>
            <div className="text-sm text-grey-500 dark:text-grey-200">Workload</div>
          </div>
          <div className="flex-1 p-2 bg-white dark:bg-grey-700 rounded-md">
            <div className="flex content-end">
              <div className="hidden lg:block">
                <StarRatings
                  rating={aggregateData.teachingRate}
                  starDimension="20px"
                  starSpacing="1px"
                  starRatedColor={darkMode ? fullConfig.theme.colors.grey[50] : fullConfig.theme.colors.grey[500]}
                  starEmptyColor={darkMode ? fullConfig.theme.colors.grey[500] : fullConfig.theme.colors.grey[200]}
                />
              </div>
              <span className="text-xl lg:ml-2">{aggregateData.teachingRate}</span>
            </div>
            <div className="text-sm text-grey-500 dark:text-grey-200">Teaching Rate</div>
          </div>
          <div className="flex-1 p-2 bg-white dark:bg-grey-700 rounded-md">
            <div className="flex content-end">
              <div className="hidden lg:block">
                <StarRatings
                  rating={aggregateData.courseRate}
                  starDimension="20px"
                  starSpacing="1px"
                  starRatedColor={darkMode ? fullConfig.theme.colors.grey[50] : fullConfig.theme.colors.grey[500]}
                  starEmptyColor={darkMode ? fullConfig.theme.colors.grey[500] : fullConfig.theme.colors.grey[200]}
                />
              </div>
              <span className="text-xl lg:ml-2">
                {aggregateData.courseRate}
              </span>
            </div>
            <div className="text-sm text-grey-500 dark:text-grey-200">Course Rate</div>
          </div>
        </div>
      </div>
      <div className="p-4 mt-3 overflow-x-scroll bg-grey-50 dark:bg-grey-800 rounded-md">
        <FCETable columns={columns} data={convertFCEData(filteredFCEs)} />
      </div>
    </>
  );
};

export const FCECard = ({ fces }) => {
  return (
    <div className="p-6 bg-white dark:bg-grey-900 rounded-md">
      <h1 className="text-lg">FCE Browser</h1>
      <FCEDetail fces={fces} />
    </div>
  );
};
