import React from "react";
import { FCE } from "../app/types";
import { FCETable } from "./FCETable";
import { useAppSelector } from "../app/hooks";

export const FCEDetail = ({ fces }: { fces: FCE[] }) => {
  const aggregationOptions = useAppSelector(
    (state) => state.user.fceAggregation
  );

  return (
    <FCETable
      fces={fces}
      columnVisibility={{ courseID: false }}
      aggregationOptions={aggregationOptions}
    />
  );
};

export const FCECard = ({ fces }: { fces: FCE[] }) => {
  return (
    <div className="bg-white border-gray-100 rounded border p-6">
      <h1 className="text-gray-700 text-lg">FCE Browser</h1>
      <FCEDetail fces={fces} />
    </div>
  );
};
