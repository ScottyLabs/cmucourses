import React from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { aggregateCourses } from "../app/fce";
import { displayUnits, roundTo } from "../app/utils";
import { selectCoursesInActiveSchedule } from "../app/user";
import { SmallButton } from "./Buttons";
import {
  selectCourseResults,
  selectFCEResultsForCourses,
} from "../app/courses";

const ScheduleData = ({ scheduled }) => {
  const dispatch = useAppDispatch();

  const loggedIn = useAppSelector((state) => state.user.loggedIn);
  const selected = useAppSelector(selectCoursesInActiveSchedule);
  const scheduledResults = useAppSelector(selectCourseResults(scheduled));

  const options = useAppSelector((state) => state.user.fceAggregation);
  const scheduledFCEs = useAppSelector(
    selectFCEResultsForCourses(scheduled || [])
  );

  if (!loggedIn) {
    return (
      <div className="text-grey-700 bg-white sticky top-0 z-10 p-8 drop-shadow-lg">
        <h1 className="text-lg font-semibold">FCE Summary</h1>
        <p>Log in to view FCE results.</p>
      </div>
    );
  }

  const selectedFCEs = scheduledFCEs.filter(({ courseID }) =>
    selected.includes(courseID)
  );

  const aggregatedData = aggregateCourses(scheduledFCEs, options);
  const aggregatedDataByCourseID = {};
  for (const row of aggregatedData.aggregatedFCEs) {
    if (row.aggregateData !== null)
      aggregatedDataByCourseID[row.courseID] = row.aggregateData;
  }

  const aggregatedSelectedData = aggregateCourses(selectedFCEs, options);
  const message = aggregatedSelectedData.message;

  const selectCourse = (value, courseID) => {
    // if (value) dispatch(userSlice.actions.addScheduleSelected(courseID));
    // else dispatch(userSlice.actions.removeScheduleSelected(courseID));
  };

  return (
    <>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-semibold">FCE Summary</h1>
          <div className="text-grey-600 text-lg">
            Total Workload{" "}
            <span className="ml-4">
              {roundTo(aggregatedSelectedData.workload, 2)} hrs/week
              {message === "" ? "" : "*"}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex justify-between">
        <SmallButton
          onClick={() => {
            // dispatch(userSlice.actions.toggleSelect());
          }}
        >
          Toggle Select
        </SmallButton>
        {/*<SmallButton*/}
        {/*  onClick={() => {*/}
        {/*    dispatch(userSlice.actions.clearBookmarks());*/}
        {/*  }}*/}
        {/*>*/}
        {/*  Clear Saved*/}
        {/*</SmallButton>*/}
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
        <tbody className="text-grey-500">
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
      <div className="text-grey-400 mt-2 text-sm">
        {message === "" ? "" : `*${message}`}
      </div>
    </>
  );
};

export default ScheduleData;
