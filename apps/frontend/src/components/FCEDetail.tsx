import React from "react";
import { FCE } from "~/app/types";
import { FCETable } from "./FCETable";
import { useAppSelector } from "~/app/hooks";

export const FCEDetail = ({
  fces,
  extraFilters,
}: {
  fces: FCE[];
  extraFilters?: boolean;
}) => {
  const aggregationOptions = useAppSelector(
    (state) => state.user.fceAggregation
  );

  return (
    <FCETable
      fces={fces}
      columnVisibility={{ courseID: false }}
      aggregationOptions={aggregationOptions}
      extraFilters={extraFilters}
    />
  );
};
