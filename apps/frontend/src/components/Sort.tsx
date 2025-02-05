import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { SortOption, sortSlice } from "~/app/sorts";
import { SortDragging } from "./SortDragging";
import { CheckIcon } from "@heroicons/react/20/solid";
import { classNames } from "~/app/utils";
import { ChevronUpDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Listbox } from "@headlessui/react";
import { type MouseEventHandler } from "react";
import { useAuth } from "@clerk/nextjs";

const OPTIONS = [
  SortOption.FCE,
  SortOption.TeachingRate,
  SortOption.CourseRate,
  SortOption.Units,
  SortOption.CourseNumber,
];

const RESTRICTED_OPTIONS = [
  SortOption.FCE,
  SortOption.TeachingRate,
  SortOption.CourseRate,
];

const Sort = () => {
  const dispatch = useAppDispatch();
  const { isSignedIn } = useAuth();

  const { sorts } = useAppSelector((state) => state.sorts);
  const items = sorts.map((sort) => sort.option);

  const resetSorts: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    dispatch(sortSlice.actions.resetSorts());
  };

  const isDisabled = (option: SortOption) =>
    !isSignedIn && RESTRICTED_OPTIONS.includes(option);

  return (
    <div>
      <div className="text-lg mb-4">Sort by</div>
      <SortDragging sorts={sorts} items={items} />
      <Listbox
        value={items}
        onChange={(options) =>
          dispatch(sortSlice.actions.updateSortsByOption(options))
        }
        multiple
      >
        <div className="flex flex-row gap-x-2">
          <Listbox.Button className="text-sm border-gray-200 relative mt-2 w-full cursor-default rounded border py-1 pl-1 pr-10 text-left transition duration-150 ease-in-out">
            <span className="flex flex-wrap gap-1">
              <span className="p-0.5">
                {items.length === 0 ? "None" : items.length} selected
              </span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 stroke-gray-500 dark:stroke-zinc-400" />
            </span>
          </Listbox.Button>

          <button
            className="rounded border border-gray-200 size-[calc(2rem+2px)] mb-auto mt-2 justify-center items-center flex"
            onClick={resetSorts}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="relative bg-white mt-1 w-full rounded shadow-lg">
          <Listbox.Options className="shadow-xs bg-white relative z-50 w-full max-h-60 overflow-auto rounded py-1 text-base leading-6 focus:outline-none sm:text-sm sm:leading-5">
            {OPTIONS.map((option) => (
              <Listbox.Option
                key={option}
                disabled={isDisabled(option)}
                value={option}
                className={({ active }) => {
                  return classNames(
                    "relative cursor-pointer select-none max-w-full py-2 pl-3 focus:outline-none",
                    active ? "bg-indigo-600 text-gray-600" : "text-gray-900"
                  );
                }}
              >
                {({ selected }) => (
                  <>
                    <span
                      aria-disabled={isDisabled(option)}
                      className={classNames(
                        "text-gray-700 ml-1",
                        selected
                          ? "font-semibold"
                          : "font-normal aria-disabled:text-gray-400"
                      )}
                    >
                      {option}
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

export default Sort;
