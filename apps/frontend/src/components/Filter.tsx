import React from "react";
import DepartmentFilter from "./filters/DepartmentFilter";
import UnitsFilter from "./filters/UnitsFilter";
import SemestersOfferedFilter from "./filters/SemestersOfferedFilter";
import LevelFilter from "./filters/LevelFilter";
import { filtersSlice } from "~/app/filters";
import { useAppDispatch } from "~/app/hooks";

const Filter = () => {
  const dispatch = useAppDispatch();

  return (
    <div>
      <div className="mb-3 text-lg">Filter by</div>
      <div className="space-y-4 text-sm">
        <DepartmentFilter />
        <UnitsFilter />
        <SemestersOfferedFilter />
        <LevelFilter />
        <div className="flex justify-end">
          <span
            className="text-gray-700 underline cursor-pointer"
            onClick={() => dispatch(filtersSlice.actions.resetFilters())}
          >
            clear all
          </span>
        </div>
      </div>
    </div>
  );
};

export default Filter;
