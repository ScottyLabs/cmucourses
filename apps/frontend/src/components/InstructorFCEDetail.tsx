import React from "react";
import { FCE } from "~/app/types";
import { FCETable } from "./FCETable";
import { AggregateFCEsOptions } from "~/app/fce";

export const InstructorFCEDetail = ({
  fces,
  aggregationOptions,
}: {
  fces: FCE[];
  aggregationOptions: AggregateFCEsOptions;
}) => {
  return (
    <FCETable
      fces={fces}
      columnVisibility={{ instructor: false }}
      aggregationOptions={aggregationOptions}
    />
  );
};
