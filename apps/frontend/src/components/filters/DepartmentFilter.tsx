import React from "react";
import { ChevronUpDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/20/solid";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { filtersSlice } from "~/app/filters";
import { Combobox } from "@headlessui/react";
import { classNames, getDepartmentByName } from "~/app/utils";
import { DEPARTMENTS } from "~/app/constants";

const DepartmentFilter = () => {
  const dispatch = useAppDispatch();

  const { active, names, query } = useAppSelector(
    (state) => state.filters.departments
  );

  const setDepartments = (departments: string[]) => {
    dispatch(filtersSlice.actions.updateDepartments(departments));
    dispatch(filtersSlice.actions.updateDepartmentsActive(true));
    setTimeout(() => {
      dispatch(filtersSlice.actions.updateDepartmentsQuery(""));
    }, 0);
  };

  const deleteDepartment = (department: string) => {
    dispatch(filtersSlice.actions.deleteDepartment(department));
  };

  const searchDepartments = (department: {
    name: string;
    shortName: string;
    prefix: string;
  }) => {
    const searchTerm = query.toLowerCase();

    return (
      department.name.toLowerCase().includes(searchTerm) ||
      department.shortName.toLowerCase().includes(searchTerm) ||
      department.prefix.toLowerCase().includes(searchTerm)
    );
  };

  return (
    <div className="relative mt-1">
      <Combobox value={names} onChange={setDepartments} multiple>
        <Combobox.Label className="flex">
          <div>
            <input
              type="checkbox"
              className="mr-2"
              checked={active}
              onChange={(e) => {
                dispatch(
                  filtersSlice.actions.updateDepartmentsActive(e.target.checked)
                );
              }}
            />
          </div>
          Department
        </Combobox.Label>
        <Combobox.Button className="relative mt-2 w-full cursor-default rounded border py-1 pl-1 pr-10 text-left transition duration-150 ease-in-out border-gray-200 sm:text-sm sm:leading-5">
          <span className="flex flex-wrap gap-1">
            {names.length === 0
              ? query.length === 0 && <span className="p-0.5">None</span>
              : names.map((department) => (
                  <span
                    key={department}
                    className="flex items-center gap-1 rounded px-2 py-0.5 text-blue-800 bg-blue-50"
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
                ))}
            <Combobox.Input
              className="shadow-xs flex rounded py-0.5 text-base leading-6 bg-white focus:outline-none sm:text-sm sm:leading-5"
              value={query} 
              onChange={(e) =>
                dispatch(
                  filtersSlice.actions.updateDepartmentsQuery(e.target.value)
                )
              }
              onKeyDown={(e: React.KeyboardEvent) => {
                if (
                  e.key === "Backspace" &&
                  query.length === 0 &&
                  names.length > 0
                ) {
                  deleteDepartment(names[names.length - 1]);
                } else if (e.key === " ") {
                  dispatch(
                    filtersSlice.actions.updateDepartmentsQuery(
                      query + " science"
                    )
                  );
                } else if (e.key === "Tab") {
                  const department =
                    DEPARTMENTS.filter(searchDepartments)[0].name;
                  if (!names.includes(department)) {
                    setDepartments(names.concat([department]));
                  }
                }
              }}
              onKeyUp={(e: React.KeyboardEvent) => {
                if (e.key === " ") {
                  e.preventDefault();
                }
              }}
            />
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 stroke-gray-500 dark:stroke-zinc-400" />
          </span>
        </Combobox.Button>
        <div className="absolute mt-1 w-full rounded shadow-lg bg-white">
          <Combobox.Options className="shadow-xs relative z-50 max-h-60 overflow-auto rounded py-1 text-base leading-6 bg-white focus:outline-none sm:text-sm sm:leading-5">
            {DEPARTMENTS.filter(searchDepartments).map(({ name, prefix }) => (
              <Combobox.Option
                key={name}
                value={name}
                className="relative cursor-pointer select-none py-2 pl-3 pr-9 focus:outline-none "
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
                          "ml-1 text-gray-700",
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
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
};

export default DepartmentFilter;
