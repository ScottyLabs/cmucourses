import React from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { aggregateCourses, AggregatedFCEs } from "../app/fce";
import { displayUnits, roundTo } from "../app/utils";
import { selectCourseResults, selectFCEResultsForCourses } from "../app/cache";
import {
  selectSelectedCoursesInActiveSchedule,
  userSchedulesSlice,
} from "../app/userSchedules";

type ScheduleDataProps = {
  scheduled: string[];
};

const ScheduleData = ({ scheduled }: ScheduleDataProps) => {
  const dispatch = useAppDispatch();

  const loggedIn = useAppSelector((state) => state.user.loggedIn);
  const active = useAppSelector((state) => state.schedules.active);
  const selected = useAppSelector(selectSelectedCoursesInActiveSchedule);
  const scheduledResults = useAppSelector(selectCourseResults(scheduled));

  const options = useAppSelector((state) => state.user.fceAggregation);
  const scheduledFCEs = useAppSelector(
    selectFCEResultsForCourses(scheduled || [])
  );

  if (!loggedIn) {
    return (
      <div className="bg-white text-gray-700 z-10">
        <p>Log in to view FCE results.</p>
      </div>
    );
  }

  if (!active) {
    return <></>;
  }

  const selectedFCEs = scheduledFCEs.filter(({ courseID }) =>
    selected.includes(courseID)
  );

  const aggregatedData = aggregateCourses(scheduledFCEs, options);
  const aggregatedDataByCourseID: { [courseID: string]: AggregatedFCEs } = {};
  for (const row of aggregatedData.aggregatedFCEs) {
    if (row.aggregateData !== null)
      aggregatedDataByCourseID[row.courseID] = row.aggregateData;
  }

  const aggregatedSelectedData = aggregateCourses(selectedFCEs, options);
  const message = aggregatedSelectedData.message;

  const selectCourse = (value: boolean, courseID: string) => {
    if (value)
      dispatch(
        userSchedulesSlice.actions.selectCourseInActiveSchedule(courseID)
      );
    else
      dispatch(
        userSchedulesSlice.actions.deselectCourseInActiveSchedule(courseID)
      );
  };

  return (
    <>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-a-600 text-lg">
            Total Workload{" "}
            <span className="ml-4">
              {roundTo(aggregatedSelectedData.workload, 2)} hrs/week
              {message === "" ? "" : "*"}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 w-full overflow-x-auto">
        <table className="w-full min-w-fit table-auto overflow-x-scroll">
          <thead>
            <tr className="text-left">
              <th />
              <th className="whitespace-nowrap pr-4 font-semibold">
                Course ID
              </th>
              <th className="whitespace-nowrap pr-4 font-semibold">
                Course Name
              </th>
              <th className="whitespace-nowrap pr-4 font-semibold">Units</th>
              <th className="whitespace-nowrap pr-4 font-semibold">Workload</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {scheduledResults &&
              scheduledResults.map((result) => {
                return (
                  <tr key={result.courseID}>
                    <td>
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selected.includes(result.courseID)}
                        onChange={(e) =>
                          selectCourse(e.target.checked, result.courseID)
                        }
                      />
                    </td>
                    <td>{result.courseID}</td>
                    <td className="whitespace-nowrap pr-4">{result.name}</td>
                    <td>{displayUnits(result.units)}</td>
                    <td>
                      {result.courseID in aggregatedDataByCourseID
                        ? aggregatedDataByCourseID[result.courseID].workload
                        : "NA"}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <div className="text-gray-500 mt-2 text-sm">
        {message === "" ? "" : `*${message}`}
      </div>
    </>
  );
};

export default ScheduleData;
