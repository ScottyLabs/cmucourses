import React, { useState } from "react";
import { SEMESTERS_COUNTED } from "~/app/constants";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { userSlice } from "~/app/user";
import { Semester } from "~/app/types";

const numericRegex = /\d/;
const numericNonemptyRegex = /^\d+$/;

interface NumericInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "onChange" | "onKeyPress"
  > {
  value: number;
  onChange: (_: number) => void;
  className: string;
}

const NumericInput = (props: NumericInputProps) => {
  const { value, onChange, onBlur, ...other } = props;
  const [isBlank, setIsBlank] = useState(false);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (numericNonemptyRegex.test(e.target.value)) {
      setIsBlank(false);
      onChange(parseInt(e.target.value));
    } else if (e.target.value === "") {
      // note: if we were to not handleKeyPress, handleChange would also be
      // called when the user enters some non-numeric input, with
      // e.target.value === ""

      // limitation of input[type=number]
      setIsBlank(true);
    } else {
      console.log("weird edge case");
    }
  };

  // only allow field to be temporarily blank
  // on unfocus, reset to last valid value
  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    if (isBlank) setIsBlank(false);
    if (onBlur) onBlur(e);
  };

  // this is only called when a key that creates a character is pressed (for
  // example symbols and alphabets; NOT backspace, arrow keys, Alt/Ctrl etc)
  const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!numericRegex.test(e.key)) e.preventDefault();
  };

  return (
    <input
      type="number"
      value={isBlank ? "" : String(value)}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyPress={handleKeyPress}
      {...other}
    />
  );
};

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
        <div className="flex items-baseline text-gray-500 text-sm">
          <div className="mr-4 whitespace-nowrap text-sm">
            Semesters to Show
          </div>
          <NumericInput
            value={numSemesters}
            className="min-w-0 flex-auto rounded border px-2 py-1 text-sm bg-transparent border-gray-200"
            onChange={setNumSemesters}
          />
        </div>
        <div className="flex flex-row justify-between text-gray-500 text-sm">
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
