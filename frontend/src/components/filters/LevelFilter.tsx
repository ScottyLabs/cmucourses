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
    value: [1, 2, 3, 4],
    content: "Undergraduate",
    heading: true,
  },
  {
    value: [1, 2],
    content: "1XX - 2XX",
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

const levelOptionsAugmented = levelOptions.map((option) => {
  let mask = 0;
  option.value.forEach((val) => (mask |= 1 << val));
  return { ...option, mask };
});

interface LevelOptionProps {
  children: React.ReactNode;
  heading?: boolean;
  mask: number;
  selectionBitfield: number;
}

const LevelOption = (props: LevelOptionProps) => {
  const { mask, children, heading, selectionBitfield } = props;

  return (
    <Listbox.Option
      value={mask}
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
          {selectionBitfield & mask && !selected ? (
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

export const getPillboxes = (bitfield: number) => {
  const pillboxes: { mask: number; content: React.ReactNode }[] = [];
  levelOptionsAugmented.forEach(({ mask, content }) => {
    if ((bitfield & mask) === mask) {
      pillboxes.push({ mask, content });
      bitfield &= ~mask;
    }
  });
  return pillboxes;
};

const LevelFilter = () => {
  const dispatch = useAppDispatch();

  const { active, bitfield } = useAppSelector((state) => state.filters.levels);

  const listboxValue = levelOptionsAugmented.flatMap(({ mask }) =>
    (mask & bitfield) === mask ? [mask] : []
  );

  const removeMask = (mask: number) => {
    dispatch(filtersSlice.actions.deleteLevel(mask));
    throttledFilter();
  };

  const setLevels = (levels: number[]) => {
    if (levels.length > listboxValue.length) {
      // we added a new level
      const delta = levels.filter((mask) => !listboxValue.includes(mask))[0];
      dispatch(filtersSlice.actions.updateLevelsActive(true));
      dispatch(filtersSlice.actions.updateLevelsBitfield(bitfield | delta));
      throttledFilter();
    } else {
      // we removed a level
      const delta = listboxValue.filter((mask) => !levels.includes(mask))[0];
      removeMask(delta);
    }
  };

  const pillboxes = getPillboxes(bitfield);

  return (
    <div className="relative mt-1">
      <Listbox value={listboxValue} onChange={setLevels} multiple>
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
              pillboxes.map(({ mask, content }) => (
                <span
                  key={mask}
                  className="text-red-800 bg-red-50 flex items-center gap-1 rounded px-2 py-0.5"
                >
                  <span>{content}</span>
                  <XMarkIcon
                    className="h-3 w-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      removeMask(mask);
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
            {levelOptionsAugmented.map(({ mask, content, heading }, index) => (
              <LevelOption
                key={index}
                heading={heading}
                mask={mask}
                selectionBitfield={bitfield}
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
