import React from "react";
import { ChevronUpDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/20/solid";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { filtersSlice } from "../../app/filters";
import { throttledFilter } from "../../app/store";
import { Listbox } from "@headlessui/react";
import { classNames, getDepartmentByName } from "../../app/utils";
import { DEPARTMENTS } from "../../app/constants";

const DepartmentFilter = () => {
  const dispatch = useAppDispatch();

  const { active, names } = useAppSelector(
    (state) => state.filters.departments
  );

  const setDepartments = (departments: string[]) => {
    dispatch(filtersSlice.actions.updateDepartments(departments));
    dispatch(filtersSlice.actions.updateDepartmentsActive(true));
    throttledFilter();
  };

  const deleteDepartment = (department: string) => {
    dispatch(filtersSlice.actions.deleteDepartment(department));
    throttledFilter();
  };

  return (
    <div className="relative mt-1">
      <Listbox value={names} onChange={setDepartments} multiple>
        <Listbox.Label className="flex">
          <div>
            <input
              type="checkbox"
              className="mr-2"
              checked={active}
              onChange={(e) => {
                dispatch(
                  filtersSlice.actions.updateDepartmentsActive(e.target.checked)
                );
                throttledFilter();
              }}
            />
          </div>
          Department
        </Listbox.Label>
        <Listbox.Button className="border-gray-200 relative mt-2 w-full cursor-default rounded border py-1 pl-1 pr-10 text-left transition duration-150 ease-in-out sm:text-sm sm:leading-5">
          <span className="block flex flex-wrap gap-1">
            {names.length === 0 ? (
              <span className="p-0.5">None</span>
            ) : (
              names.map((department) => (
                <span
                  key={department}
                  className="text-blue-800 bg-blue-50 flex items-center gap-1 rounded px-2 py-0.5"
                >
                  <span>{getDepartmentByName(department).shortName}</span>
                  <XMarkIcon
                    className="h-3 w-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      deleteDepartment(department);
                    }}
                  />
                </span>
              ))
            )}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 stroke-gray-500 dark:stroke-zinc-400" />
          </span>
        </Listbox.Button>
        <div className="bg-white absolute mt-1 w-full rounded shadow-lg">
          <Listbox.Options className="shadow-xs bg-white relative z-50 max-h-60 overflow-auto rounded py-1 text-base leading-6 focus:outline-none sm:text-sm sm:leading-5">
            {DEPARTMENTS.map(({ name, prefix }) => (
              <Listbox.Option
                key={name}
                value={name}
                className={({ active }) => {
                  return classNames(
                    "relative cursor-pointer select-none py-2 pl-3 pr-9 focus:outline-none ",
                    active ? "bg-indigo-600 text-gray-600" : "text-gray-900"
                  );
                }}
              >
                {({ selected }) => (
                  <>
                    <span className={"block truncate"}>
                      <span className="inline-block w-12">
                        {prefix}
                        <span className="text-gray-300">XXX</span>
                      </span>
                      <span
                        className={classNames(
                          "text-gray-700 ml-1",
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

export default DepartmentFilter;
