import React from "react";
import { SEMESTERS_COUNTED } from "../app/constants";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { userSlice } from "../app/user";
import { Semester } from "../app/types";

const numericRegex = /\d/;
const numSemsDispatchableRegex = /\d+/g;

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

  // Auxiliary local state required to handle the case when the field is (temporarily) blank
  const [numSemsField, setNumSemsField] = React.useState<number | undefined>(
    undefined
  );

  // To update the global state
  React.useEffect(() => {
    setNumSemsField(numSemesters);
  }, [numSemesters]);

  /* Needed to prevent non-numeric input from being entered by the user. */
  const handleNumSemsFieldKeyDown: React.KeyboardEventHandler<
    HTMLInputElement
  > = (e) => {
    if (!numeric.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumSemsFieldChange: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    if (numSemsDispatchableRegex.test(e.target.value)) {
      setNumSemesters(parseInt(e.target.value));
    } else if (e.target.value === "") {
      setNumSemsField(undefined);
    }
  };

  // Restore the last valid value if the field is left blank and unfocused
  const handleNumSemsFieldBlur: React.FocusEventHandler<
    HTMLInputElement
  > = () => {
    if (numSemsField === undefined) setNumSemsField(numSemesters);
  };

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
            value={numSemsField === undefined ? "" : numSemsField}
            className="border-gray-200 min-w-0 flex-auto rounded border px-2 py-1 text-sm bg-transparent"
            onChange={handleNumSemsFieldChange}
            onBlur={handleNumSemsFieldBlur}
            onKeyPress={handleNumSemsFieldKeyDown}
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
