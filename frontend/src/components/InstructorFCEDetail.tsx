import React from "react";
import { FCE } from "../app/types";
import { FCETable } from "./FCETable";

export const InstructorFCEDetail = ({ fces }: { fces: FCE[] }) => {
  const aggregationOptions = {
    numSemesters: 10,
    counted: { spring: true, summer: true, fall: true },
  };

  return (
    <FCETable
      fces={fces}
      columnVisibility={{ instructor: false }}
      aggregationOptions={aggregationOptions}
    />
  );
};
