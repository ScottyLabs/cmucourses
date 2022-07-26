import React from "react";
import { SEMESTERS_COUNTED } from "../app/constants";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { userSlice } from "../app/user";
import { Semester } from "../app/types";

const Aggregate = () => {
  const dispatch = useAppDispatch();

  const counted = useAppSelector((state) => state.user.fceAggregation.counted);
  const setCounted = (semester: Semester, value: boolean) => {
    dispatch(userSlice.actions.updateSemestersCounted({ semester, value }));
  };
  const setNumSemesters = (numSemesters: number) => {
    dispatch(userSlice.actions.updateNumSemesters(numSemesters));
  };
  const numSemesters = useAppSelector(
    (state) => state.user.fceAggregation.numSemesters
  );

  return (
    <div>
      <div className="text-lg">Aggregate FCEs</div>
      <div className="mt-3 space-y-3">
        <div className="flex items-baseline">
          <div className="mr-4 whitespace-nowrap text-sm">
            Semesters to Show
          </div>
          <input
            type="number"
            value={numSemesters}
            className="border-gray-200 min-w-0 flex-auto rounded border px-2 py-1 text-sm bg-transparent"
            onChange={(e) => {
              setNumSemesters(parseInt(e.target.value));
            }}
          />
        </div>
        <div className="flex flex-row justify-between text-sm">
          {SEMESTERS_COUNTED.map((sem) => (
            <label className="capitalize" key={sem}>
              <input
                type="checkbox"
                className="mr-1"
                checked={counted[sem]}
                onChange={(e) => setCounted(sem, e.target.checked)}
              />{" "}
              {sem}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Aggregate;
