import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { throttledFilter } from "../app/store";
import { filtersSlice } from "../app/filters";
import { DEPARTMENTS } from "../app/constants";
import { Listbox } from "@headlessui/react";
import { classNames, getDepartmentByName } from "../app/utils";
import { ChevronUpDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/20/solid";
import * as Slider from "@radix-ui/react-slider";

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

const UnitsFilter = () => {
  const dispatch = useAppDispatch();
  const { active, min, max } = useAppSelector((state) => state.filters.units);

  const [value, setValue] = React.useState([0, 24]);
  const [init, setInit] = React.useState(false);
  useEffect(() => {
    setInit(true);
    if (!init) setValue([min, max]);
  }, [min, max, init]);

  return (
    <div className="mt-2 flex">
      <div>
        <input
          type="checkbox"
          className="mr-2"
          checked={active}
          onChange={(e) => {
            dispatch(filtersSlice.actions.updateUnitsActive(e.target.checked));
            throttledFilter();
          }}
        />
      </div>
      <div className="mr-6">Units</div>
      <div className="flex-1">
        <Slider.Root
          step={1}
          min={0}
          max={24}
          value={value}
          onValueChange={setValue}
          className="relative flex h-6 w-full select-none items-center"
        >
          <Slider.Track className="bg-gray-100 relative h-0.5 flex-grow outline-none">
            <Slider.Range className="bg-blue-500 absolute h-full rounded-full outline-none" />
          </Slider.Track>
          {[1, 2].map((i) => (
            <Slider.Thumb
              key={i}
              className="bg-blue-600 relative z-40 block h-3 w-3 cursor-pointer rounded-full font-bold shadow-xl outline-none ring-blue-200 hover:ring-4"
              onPointerUp={() => {
                dispatch(
                  filtersSlice.actions.updateUnitsRange(
                    value as [number, number]
                  )
                );
                dispatch(filtersSlice.actions.updateUnitsActive(true));
                if (active) throttledFilter();
              }}
            />
          ))}
        </Slider.Root>
      </div>
      <div className="ml-5 w-10 text-right">
        {value[0]}-{value[1]}
      </div>
    </div>
  );
};

const Filter = () => {
  const dispatch = useAppDispatch();

  const exactMatchesOnly = useAppSelector(
    (state) => state.filters.exactMatchesOnly
  );

  return (
    <div>
      <div className="mb-3 text-lg">Filter by</div>
      <div className="space-y-4 text-sm">
        <div>
          <input
            type="checkbox"
            className="mr-2"
            checked={exactMatchesOnly}
            onChange={(e) => {
              dispatch(
                filtersSlice.actions.updateExactMatchesOnly(e.target.checked)
              );
              throttledFilter();
            }}
          />
          <span>Show Exact ID Matches Only</span>
        </div>

        <DepartmentFilter />
        <UnitsFilter />
      </div>
    </div>
  );
};

export default Filter;
