import React from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { aggregateCourses } from "../app/fce";
import { displayUnits, roundTo } from "../app/utils";
import { userSlice } from "../app/user";

const BookmarkedData = () => {
  const dispatch = useAppDispatch();

  const loggedIn = useAppSelector(state => state.user.loggedIn);
  const bookmarked = useAppSelector((state) => state.user.bookmarked);
  const selected = useAppSelector(state => state.user.selected);
  const bookmarkedResults = useAppSelector((state) => state.courses.bookmarkedResults);
  const FCEs = useAppSelector((state) => state.courses.fces);
  const options = useAppSelector(state => state.user.fceAggregation);

  if (!loggedIn) {
    return (
      <div className="sticky top-0 z-10 p-8 bg-white text-zinc-700 drop-shadow-lg">
        <h1 className="text-lg font-semibold">FCE Summary</h1>
        <p>Log in to view FCE results.</p>
      </div>
    );
  }

  const bookmarkedFCEs = [];

  for (const courseID of bookmarked) {
    if (courseID in FCEs) {
      bookmarkedFCEs.push({ courseID, fces: FCEs[courseID] });
    } else {
      bookmarkedFCEs.push({ courseID, fces: null });
    }
  }

  const selectedFCEs = bookmarkedFCEs.filter(({ courseID }) => (selected.includes(courseID)));

  const aggregatedData = aggregateCourses(bookmarkedFCEs, options);
  const aggregatedDataByCourseID = {};
  for (const row of aggregatedData.aggregatedFCEs) {
    if (row.aggregateData !== null)
      aggregatedDataByCourseID[row.courseID] = row.aggregateData;
  }

  const aggregatedSelectedData = aggregateCourses(selectedFCEs, options);
  const message = aggregatedSelectedData.message;

  const selectCourse = (value, courseID) => {
    if (value)
      dispatch(userSlice.actions.addSelected(courseID));
    else
      dispatch(userSlice.actions.removeSelected(courseID));
  };

  return (
    <div className="sticky top-0 z-10 p-8 bg-white text-zinc-700 drop-shadow-lg">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-lg font-semibold">FCE Summary</h1>
          <div className="text-lg text-zinc-600">
            Total Workload{" "}
            <span className="ml-4">
            {roundTo(aggregatedSelectedData.workload, 2)} hrs/week{message === "" ? "" : "*"}
          </span>
          </div>
        </div>
        <div>
          <div className="text-sm py-1 px-2 bg-gray-100 rounded-md text-gray-600 hover:cursor-pointer"
            onClick={() => {dispatch(userSlice.actions.clearBookmarks());}}>Clear Saved</div>
        </div>
      </div>
      <table className="w-full mt-3 table-auto">
        <thead>
        <tr className="text-left">
          <th />
          <th className="font-semibold">Course ID</th>
          <th className="font-semibold">Course Name</th>
          <th className="font-semibold">Units</th>
          <th className="font-semibold">Workload (hrs/week)</th>
        </tr>
        </thead>
        <tbody className="text-zinc-500">
        {bookmarkedResults &&
          bookmarkedResults.map((result) => {
            return (
              <tr>
                <td><input type="checkbox" className="mr-2" checked={selected.includes(result.courseID)}
                           onChange={(e) => selectCourse(e.target.checked, result.courseID)} /></td>
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
      <div className="mt-2 text-sm text-zinc-400">
        { message === "" ? "" : `*${message}` }
      </div>
    </div>
  );
};

export default BookmarkedData;
