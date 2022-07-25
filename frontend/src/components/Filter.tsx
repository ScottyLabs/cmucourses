import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { throttledFilter } from "../app/store";
import { userSlice } from "../app/user";
import { DEPARTMENTS } from "../app/constants";
import { Listbox } from "@headlessui/react";
import { classNames, getDepartmentByName } from "../app/utils";
import { CheckIcon, SelectorIcon, XIcon } from "@heroicons/react/solid";
import * as Slider from "@radix-ui/react-slider";

const DepartmentFilter = () => {
  const dispatch = useAppDispatch();
  const filterDepartments = useAppSelector(
    (state) => state.user.filter.departments
  );

  const setDepartments = (departments: string[]) => {
    dispatch(userSlice.actions.updateDepartments(departments));
    throttledFilter();
  };

  return (
    <div className="relative mt-1">
      <Listbox value={filterDepartments} onChange={setDepartments} multiple>
        <Listbox.Label className="flex font-semibold">
          <div>
            <input
              type="checkbox"
              className="mr-2"
              checked={true}
              onChange={(e) => {
                // TODO
              }}
            />
          </div>
          Department
        </Listbox.Label>
        <Listbox.Button className="bg-gray-50 relative mt-2 w-full cursor-default rounded-md py-2 pl-2 pr-10 text-left transition duration-150 ease-in-out sm:text-sm sm:leading-5">
          <span className="block flex flex-wrap gap-2">
            {filterDepartments.length === 0 ? (
              <span className="p-0.5">None</span>
            ) : (
              filterDepartments.map((department) => (
                <span
                  key={department}
                  className="text-blue-800 bg-blue-50 flex items-center gap-1 rounded px-2 py-0.5"
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
        <div className="bg-white absolute mt-1 w-full rounded-md shadow-lg">
          <Listbox.Options className="shadow-xs bg-white relative z-50 max-h-60 overflow-auto rounded-md py-1 text-base leading-6 focus:outline-none sm:text-sm sm:leading-5">
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

const UnitsFilter = () => {
  const dispatch = useAppDispatch();
  const { active, min, max } = useAppSelector(
    (state) => state.user.filter.units
  );

  const [value, setValue] = React.useState([0, 24]);
  useEffect(() => {
    setValue([min, max]);
  }, []);

  return (
    <div className="mt-2 flex">
      <div>
        <input
          type="checkbox"
          className="mr-2"
          checked={active}
          onChange={(e) => {
            dispatch(
              userSlice.actions.updateUnitsFilterActive(e.target.checked)
            );
            throttledFilter();
          }}
        />
      </div>
      <div className="mr-6 font-semibold">Units</div>
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
                  userSlice.actions.updateUnitsRange(value as [number, number])
                );
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
    (state) => state.user.filter.exactMatchesOnly
  );

  return (
    <div className="pb-6">
      <div className="mb-3 text-lg">Filter by</div>
      <div className="space-y-4 text-sm">
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
        <UnitsFilter />
      </div>
    </div>
  );
};

export default Filter;
