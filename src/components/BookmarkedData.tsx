import React, { useState } from "react";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { aggregateCourses } from "../app/fce";
import { roundTo } from "../app/utils";

const BookmarkedData = () => {
  const bookmarked = useSelector(
    (state: RootStateOrAny) => state.user.bookmarked
  );

  const bookmarkedResults = useSelector(
    (state: RootStateOrAny) => state.courses.bookmarkedResults
  );

  const FCEs = useSelector((state: RootStateOrAny) => state.courses.fces);
  const bookmarkedFCEs = [];

  for (const courseID of bookmarked) {
    if (courseID in FCEs) {
      bookmarkedFCEs.push({ courseID, fces: FCEs[courseID] });
    }
  }

  const aggregatedData = aggregateCourses(bookmarkedFCEs, 2);
  console.log(aggregatedData);
  const aggregatedDataByCourseID = {};
  for (const row of aggregatedData.aggregatedFCEs) {
    aggregatedDataByCourseID[row.courseID] = row.aggregateData;
  }

  return (
    <div className="sticky top-0 z-10 p-8 bg-white text-zinc-700 drop-shadow-lg">
      <h1 className="text-lg font-semibold">FCE Summary</h1>
      <div className="text-lg text-zinc-600">
        Total Workload{" "}
        <span className="ml-4">
          {roundTo(aggregatedData.workload, 2)} hrs/week
        </span>
      </div>
      <table className="w-full mt-3 table-auto">
        <thead>
          <tr className="text-left">
            <th className="font-semibold">Course ID</th>
            <th className="font-semibold">Course Name</th>
            <th className="font-semibold">Workload (hrs/week)</th>
          </tr>
        </thead>
        <tbody className="text-zinc-500">
          {bookmarkedResults &&
            bookmarkedResults.map((result) => {
              return (
                <tr>
                  <td>{result.courseID}</td>
                  <td>{result.name}</td>
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
  );
};

export default BookmarkedData;
