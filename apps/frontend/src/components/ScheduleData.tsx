import React from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { aggregateCourses, AggregatedFCEs } from "~/app/fce";
import { displayUnits, isValidUnits, roundTo } from "~/app/utils";
import {
  selectSelectedCoursesInActiveSchedule,
  userSchedulesSlice,
} from "~/app/userSchedules";
import { FlushedButton } from "./Buttons";
import { uiSlice } from "~/app/ui";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { useFetchCourseInfos } from "~/app/api/course";
import { useFetchFCEInfosByCourse } from "~/app/api/fce";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { Course } from "~/app/types";

type ScheduleDataProps = {
  scheduled: string[];
};

const ScheduleData = ({ scheduled }: ScheduleDataProps) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const active = useAppSelector((state) => state.schedules.active);
  const selected = useAppSelector(selectSelectedCoursesInActiveSchedule);
  const options = useAppSelector((state) => state.user.fceAggregation);

  const { isSignedIn, getToken } = useAuth();
  const scheduledResults = useFetchCourseInfos(scheduled);
  const scheduledFCEs = useFetchFCEInfosByCourse(
    scheduled,
    isSignedIn,
    getToken
  );

  const open = useAppSelector((state) => state.ui.schedulesTopbarOpen);

  if (!isSignedIn) {
    return (
      <div className="z-10 bg-white text-gray-700">
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

  const selectedResults = scheduledResults.filter(({ courseID }) =>
    selected.includes(courseID)
  );

  const aggregatedData = aggregateCourses(
    scheduledFCEs,
    scheduledResults,
    options
  );
  const aggregatedDataByCourseID: { [courseID: string]: AggregatedFCEs } = {};
  for (const row of aggregatedData.aggregatedFCEs) {
    if (row.aggregateData !== null)
      aggregatedDataByCourseID[row.courseID] = row.aggregateData;
  }

  const aggregatedSelectedData = aggregateCourses(
    selectedFCEs,
    selectedResults,
    options
  );
  const fceMessage = aggregatedSelectedData.fceMessage;
  const unitsMessage = aggregatedSelectedData.unitsMessage;

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

  const updateManualUnits = (courseID: string, manualUnits: string) => {
    queryClient.setQueryData(
      ["courseInfo", { courseID }],
      (oldData: Course) => {
        return {
          ...oldData,
          manualUnits,
        };
      }
    );
  };

  return (
    <>
      <div className="flex items-end justify-between">
        <div className="flex">
          <div className="text-a-600 text-lg">
            Total Workload{" "}
            <span className="ml-4">
              {aggregatedSelectedData.totalUnits} units
              {unitsMessage === "" ? "" : <sup>+</sup>},
            </span>
            <span className="ml-4">
              {roundTo(aggregatedSelectedData.workload, 2)} hrs/week
              {fceMessage === "" ? "" : "*"}
            </span>
            <button className="absolute right-3 z-40 md:right-2">
              <FlushedButton
                onClick={() =>
                  dispatch(uiSlice.actions.toggleSchedulesTopbarOpen())
                }
              >
                <div className="flex items-center">
                  {open ? (
                    <>
                      <div className="mr-1">Hide</div>
                      <ChevronUpIcon className="h-5 w-5" />
                    </>
                  ) : (
                    <>
                      <div className="mr-1">Show</div>
                      <ChevronDownIcon className="h-5 w-5" />
                    </>
                  )}
                </div>
              </FlushedButton>
            </button>
          </div>
        </div>
      </div>
      {open && (
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
                <th className="whitespace-nowrap pr-4 font-semibold">
                  Workload
                </th>
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
                      <td>
                        {!isValidUnits(result.units) ? (
                          <input
                            className="w-20 bg-white"
                            value={
                              result.manualUnits !== undefined
                                ? displayUnits(result.manualUnits)
                                : displayUnits(result.units)
                            }
                            onClick={() => {
                              if (result.manualUnits === undefined) {
                                updateManualUnits(result.courseID, "");
                              }
                            }}
                            onChange={(e) =>
                              updateManualUnits(result.courseID, e.target.value)
                            }
                            placeholder="Units"
                          />
                        ) : (
                          displayUnits(result.units)
                        )}
                      </td>
                      <td>
                        {result.courseID in aggregatedDataByCourseID
                          ? aggregatedDataByCourseID[result.courseID]?.workload
                          : "NA"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-3 text-sm text-gray-500">
        {unitsMessage === "" ? (
          ""
        ) : (
          <div>
            <sup>+</sup>
            {unitsMessage}
          </div>
        )}
        {fceMessage === "" ? "" : `*${fceMessage}`}
      </div>
    </>
  );
};

export default ScheduleData;
