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

  return (
    <div>
      <div className="text-md">Aggregate FCEs</div>
      <div className="mt-3 space-y-3">
        <div className="flex items-baseline">
          <div className="mr-2 whitespace-nowrap text-sm font-semibold">
            Semesters to Sample
          </div>
          <input
            placeholder="2"
            className="bg-gray-50 min-w-0 flex-auto rounded-md px-2 py-1 text-sm"
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
