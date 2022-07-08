import React from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { aggregateCourses, AggregatedFCEs } from "../app/fce";
import { displayUnits, roundTo } from "../app/utils";
import {
  selectCourseResults,
  selectFCEResultsForCourses,
} from "../app/courses";
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
      <div className="bg-white text-gray-700 sticky top-0 z-10 p-8 drop-shadow-lg">
        <h1 className="text-lg font-semibold">FCE Summary</h1>
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

  console.log(aggregatedSelectedData);

  return (
    <>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-semibold">FCE Summary</h1>
          <div className="text-a-600 text-lg">
            Total Workload{" "}
            <span className="ml-4">
              {roundTo(aggregatedSelectedData.workload, 2)} hrs/week
              {message === "" ? "" : "*"}
            </span>
          </div>
        </div>
      </div>
      <table className="mt-3 w-full table-auto">
        <thead>
          <tr className="text-left">
            <th />
            <th className="font-semibold">Course ID</th>
            <th className="font-semibold">Course Name</th>
            <th className="font-semibold">Units</th>
            <th className="font-semibold">Workload</th>
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
                  <td>{result.name}</td>
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
      <div className="text-gray-500 mt-2 text-sm">
        {message === "" ? "" : `*${message}`}
      </div>
    </>
  );
};

export default ScheduleData;
