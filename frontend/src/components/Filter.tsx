import React from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { throttledFilter } from "../app/store";
import { userSlice } from "../app/user";
import { DEPARTMENTS } from "../app/constants";
import { Listbox } from "@headlessui/react";
import { classNames, getDepartmentByName } from "../app/utils";
import { CheckIcon, SelectorIcon, XIcon } from "@heroicons/react/solid";

const DepartmentFilter = () => {
  const dispatch = useAppDispatch();
  const filterDepartments = useAppSelector(
    (state) => state.user.filter.departments
  );

  const setDepartments = (departments) => {
    dispatch(userSlice.actions.updateDepartments(departments));
    throttledFilter();
  };

  return (
    <div className="relative mt-1">
      <Listbox value={filterDepartments} onChange={setDepartments} multiple>
        <Listbox.Label className="font-semibold">Department</Listbox.Label>
        <Listbox.Button className="focus:shadow-outline-blue relative mt-2 w-full cursor-default rounded-md bg-grey-50 py-2 pl-2 pr-10 text-left transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5">
          <span className="block flex flex-wrap gap-2">
            {filterDepartments.length === 0 ? (
              <span className="p-0.5">None</span>
            ) : (
              filterDepartments.map((department) => (
                <span
                  key={department}
                  className="flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5"
                >
                  <span>{getDepartmentByName(department).shortName}</span>
                  <XIcon
                    className="h-3 w-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDepartments(
                        filterDepartments.filter((d) => d !== department)
                      );
                    }}
                  />
                </span>
              ))
            )}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <SelectorIcon className="h-5 w-5" />
          </span>
        </Listbox.Button>
        <div className="absolute mt-1 w-full rounded-md bg-white shadow-lg">
          <Listbox.Options className="shadow-xs max-h-60 overflow-auto rounded-md py-1 text-base leading-6 focus:outline-none sm:text-sm sm:leading-5">
            {DEPARTMENTS.map(({ name, prefix, shortName }) => (
              <Listbox.Option
                key={name}
                value={name}
                className={({ active }) => {
                  return classNames(
                    "relative cursor-pointer select-none py-2 pl-3 pr-9 focus:outline-none",
                    active ? "bg-indigo-600 text-grey-600" : "text-grey-900"
                  );
                }}
              >
                {({ active, selected }) => (
                  <>
                    <span className={"block truncate"}>
                      <span className="inline-block w-12">
                        {prefix}
                        <span className="text-grey-300">XXX</span>
                      </span>
                      <span
                        className={classNames(
                          "ml-1",
                          selected ? "font-semibold" : "font-normal"
                        )}
                      >
                        {name}
                      </span>
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <CheckIcon className="h-5 w-5" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
};

const Filter = () => {
  const dispatch = useAppDispatch();

  const exactMatchesOnly = useAppSelector(
    (state) => state.user.filter.exactMatchesOnly
  );

  return (
    <div className="pb-6">
      <div className="mb-3 text-lg">Filter by</div>
      <div className="space-y-3 text-sm">
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

        <div>
          <input
            type="checkbox"
            className="mr-2"
            checked={exactMatchesOnly}
            onChange={(e) => {
              dispatch(userSlice.actions.setExactMatchesOnly(e.target.checked));
              throttledFilter();
            }}
          />
          Show Exact ID Matches Only
        </div>

        <DepartmentFilter />
      </div>
    </div>
  );
};

export default Filter;
