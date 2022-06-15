import React from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { aggregateCourses } from "../app/fce";
import { displayUnits, roundTo } from "../app/utils";
import { userSlice } from "../app/user";
import SmallButton from "./SmallButton";
import {
  selectCourseResults,
  selectFCEResultsForCourses,
} from "../app/courses";

const BookmarkedData = () => {
  const dispatch = useAppDispatch();

  const loggedIn = useAppSelector((state) => state.user.loggedIn);
  const bookmarked = useAppSelector((state) => state.user.bookmarked);
  const selected = useAppSelector((state) => state.user.bookmarkedSelected);
  const bookmarkedResults = useAppSelector(selectCourseResults(bookmarked));

  const options = useAppSelector((state) => state.user.fceAggregation);
  const bookmarkedFCEs = useAppSelector(selectFCEResultsForCourses(bookmarked));

  if (!loggedIn) {
    return (
      <div className="sticky top-0 z-10 bg-white p-8 text-gray-700 drop-shadow-lg dark:bg-gray-900 dark:text-gray-200">
        <h1 className="text-lg font-semibold">FCE Summary</h1>
        <p>Log in to view FCE results.</p>
      </div>
    );
  }

  const selectedFCEs = bookmarkedFCEs.filter(({ courseID }) =>
    selected.includes(courseID)
  );

  const aggregatedData = aggregateCourses(bookmarkedFCEs, options);
  const aggregatedDataByCourseID = {};
  for (const row of aggregatedData.aggregatedFCEs) {
    if (row.aggregateData !== null)
      aggregatedDataByCourseID[row.courseID] = row.aggregateData;
  }

  const aggregatedSelectedData = aggregateCourses(selectedFCEs, options);
  const message = aggregatedSelectedData.message;

  const selectCourse = (value, courseID) => {
    if (value) dispatch(userSlice.actions.addSelected(courseID));
    else dispatch(userSlice.actions.removeSelected(courseID));
  };

  return (
    <div className="sticky top-0 z-10 bg-white p-8 text-gray-700 drop-shadow-lg dark:bg-gray-900 dark:text-gray-200">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-semibold">FCE Summary</h1>
          <div className="text-lg text-gray-600 dark:text-gray-200">
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
            dispatch(userSlice.actions.toggleSelect());
          }}
        >
          Toggle Select
        </SmallButton>
        <SmallButton
          onClick={() => {
            dispatch(userSlice.actions.clearBookmarks());
          }}
        >
          Clear Saved
        </SmallButton>
      </div>
      <table className="mt-3 w-full table-auto">
        <thead>
          <tr className="text-left">
            <th />
            <th className="font-semibold">Course ID</th>
            <th className="font-semibold">Course Name</th>
            <th className="font-semibold">Units</th>
            <th className="font-semibold">Workload (hrs/week)</th>
          </tr>
        </thead>
        <tbody className="text-gray-500 dark:text-gray-300">
          {bookmarkedResults &&
            bookmarkedResults.map((result) => {
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
      <div className="mt-2 text-sm text-gray-400 dark:text-gray-300">
        {message === "" ? "" : `*${message}`}
      </div>
    </div>
  );
};

export default BookmarkedData;
