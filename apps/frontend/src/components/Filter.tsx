import React from "react";
import DepartmentFilter from "./filters/DepartmentFilter";
import UnitsFilter from "./filters/UnitsFilter";
import SemestersOfferedFilter from "./filters/SemestersOfferedFilter";
import LevelFilter from "./filters/LevelFilter";

const Filter = () => {
  return (
    <div>
      <div className="mb-3 text-lg">Filter by</div>
      <div className="space-y-4 text-sm">
        <DepartmentFilter />
        <UnitsFilter />
        <SemestersOfferedFilter />
        <LevelFilter />
      </div>
    </div>
  );
};

export default Filter;
