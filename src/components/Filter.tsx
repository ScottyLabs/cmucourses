import Select, { components } from "react-select";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { throttledFilter } from "../app/store";
import { userSlice } from "../app/user";
import { DEPARTMENTS } from "../app/constants";

const Input = (props) => (
  <components.Input {...props} inputClassName={"bg-white dark:bg-grey-800"}/>
);

const Filter = () => {
  const dispatch = useAppDispatch();
  const [departments, setDepartments] = useState({ });
  const filterDepartments = useAppSelector((state) => state.user.filter.departments);

  const changeDepartment = (e) => {
    const departments = e.map(({ value }) => value);
    setDepartments(e);
    dispatch(userSlice.actions.updateDepartments(departments));
    throttledFilter();
  };

  const DEPARTMENT_OPTIONS = DEPARTMENTS.map((name) => ({
    value: name,
    label: name,
  }));

  useEffect(() => {
    setDepartments(filterDepartments.map(value => ({value, label: value})));
  }, []);

  return (
    <div className="pb-3">
      <div className="mb-3 text-lg">Filter by</div>
      <div className="text-sm divide-y">
        {/*<div className="py-3">*/}
        {/*  <div className="mb-1 font-semibold">Semester</div>*/}
        {/*  <div className="flex flex-col space-y-1 text-sm">*/}
        {/*    <label>*/}
        {/*      <input type="checkbox" className="mr-2" /> Fall 2021*/}
        {/*    </label>*/}
        {/*    <label>*/}
        {/*      <input type="checkbox" className="mr-2" /> Spring 2022*/}
        {/*    </label>*/}
        {/*  </div>*/}
        {/*</div>*/}

        {/*<div className="py-3">*/}
        {/*  <div className="mb-1 font-semibold">Course Type</div>*/}
        {/*  <div className="flex flex-col space-y-1 text-sm">*/}
        {/*    <label>*/}
        {/*      <input type="checkbox" className="mr-2" /> Mini*/}
        {/*    </label>*/}
        {/*    <label>*/}
        {/*      <input type="checkbox" className="mr-2" /> Non-Mini*/}
        {/*    </label>*/}
        {/*  </div>*/}
        {/*</div>*/}

        <div className="py-3">
          <div className="mb-2 font-semibold">Department</div>
          <Select
            isMulti
            value={departments}
            options={DEPARTMENT_OPTIONS}
            onChange={changeDepartment}
            components={{ Input }}/>
        </div>
      </div>
    </div>
  );
};

export default Filter;
