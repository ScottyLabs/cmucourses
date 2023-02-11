import { Listbox } from "@headlessui/react";
import { CheckIcon, MinusIcon } from "@heroicons/react/20/solid";
import { ChevronUpDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import React from "react";
import { filtersSlice } from "../../app/filters";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { throttledFilter } from "../../app/store";
import { classNames } from "../../app/utils";

const levelOptions = [
  {
    value: [0, 1, 2, 3, 4],
    content: "Undergraduate",
    heading: true,
  },
  {
    value: [0, 1, 2],
    content: "0XX - 2XX",
  },
  {
    value: [3, 4],
    content: "3XX - 4XX",
  },
  {
    value: [5, 6, 7, 8, 9],
    content: "Graduate",
    heading: true,
  },
  {
    value: [5, 6],
    content: "5XX - 6XX",
  },
  {
    value: [7, 8, 9],
    content: "7XX - 9XX",
  },
];

interface LevelOptionProps {
  children: React.ReactNode;
  heading?: boolean;
  indices: number[];
  selection: boolean[];
}

function matches(indices: number[], selection: boolean[]): boolean {
  return indices.every((index) => selection[index]);
}

const LevelOption = (props: LevelOptionProps) => {
  const { children, heading, indices, selection } = props;

  return (
    <Listbox.Option
      value={indices}
      className={({ active }) => {
        return classNames(
          "relative cursor-pointer select-none py-2 pl-3 pr-9 focus:outline-none ",
          active ? "bg-indigo-600 text-gray-600" : "text-gray-900"
        );
      }}
    >
      {({ selected }) => (
        <>
          <span className={`block truncate ${heading ? "" : "pl-6"}`}>
            {children}
          </span>
          {selected && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-4">
              <CheckIcon className="h-5 w-5" />
            </span>
          )}
          {matches(indices, selection) && !selected ? (
            <span className="absolute inset-y-0 right-0 flex items-center pr-4">
              <MinusIcon className="h-5 w-5" />
            </span>
          ) : (
            <></>
          )}
        </>
      )}
    </Listbox.Option>
  );
};

export const getPillboxes = (selection: boolean[]) => {
  const pillboxes: { levels: number[]; content: React.ReactNode }[] = [];
  const selectedLevels = [...selection];
  levelOptions.forEach(({ value, content }) => {
    if (matches(value, selectedLevels)) {
      pillboxes.push({ levels: value, content });
      for (const index of value) {
        selectedLevels[index] = false;
      }
    }
  });
  return pillboxes;
};

const LevelFilter = () => {
  const dispatch = useAppDispatch();

  const { active, selected } = useAppSelector((state) => state.filters.levels);

  const listboxValue = levelOptions.flatMap(({ value: optionLevels }) =>
    matches(optionLevels, selected) ? [optionLevels] : []
  );

  const removeLevel = (levels: number[]) => {
    dispatch(filtersSlice.actions.deleteLevel(levels));
    throttledFilter();
  };

  const updateListboxValue = (newListboxValue: number[][]) => {
    if (newListboxValue.length > listboxValue.length) {
      // we added a new level
      // make a copy of the old levels boolean array
      const newLevels = [...selected];

      // find the newly added level
      const delta = newListboxValue.filter((x) => !listboxValue.includes(x))[0];
      for (const idx of delta) {
        newLevels[idx] = true; // update boolean array
      }

      dispatch(filtersSlice.actions.updateLevelsActive(true));
      dispatch(filtersSlice.actions.updateLevelsSelection(newLevels));
      throttledFilter();
    } else {
      // we removed a level
      // find the removed level
      const delta = listboxValue.filter((x) => !newListboxValue.includes(x))[0];
      removeLevel(delta);
    }
  };

  const pillboxes = getPillboxes(selected);

  return (
    <div className="relative mt-1">
      <Listbox value={listboxValue} onChange={updateListboxValue} multiple>
        <Listbox.Label className="flex">
          <div>
            <input
              type="checkbox"
              className="mr-2"
              checked={active}
              onChange={(e) => {
                dispatch(
                  filtersSlice.actions.updateLevelsActive(e.target.checked)
                );
                throttledFilter();
              }}
            />
          </div>
          Course Level
        </Listbox.Label>
        <Listbox.Button className="border-gray-200 relative mt-2 w-full cursor-default rounded border py-1 pl-1 pr-10 text-left transition duration-150 ease-in-out sm:text-sm sm:leading-5">
          <span className="block flex flex-wrap gap-1">
            {pillboxes.length === 0 ? (
              <span className="p-0.5">None</span>
            ) : (
              pillboxes.map(({ levels, content }) => (
                <span
                  key={levels.toString()}
                  className="text-red-800 bg-red-50 flex items-center gap-1 rounded px-2 py-0.5"
                >
                  <span>{content}</span>
                  <XMarkIcon
                    className="h-3 w-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      removeLevel(levels);
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
            {levelOptions.map(({ content, heading, value }, index) => (
              <LevelOption
                key={index}
                heading={heading}
                indices={value}
                selection={selected}
              >
                {content}
              </LevelOption>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
};

export default LevelFilter;
