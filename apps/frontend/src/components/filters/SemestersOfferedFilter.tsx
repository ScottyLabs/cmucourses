import { Listbox } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { ChevronUpDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import React from "react";
import { filtersSlice } from "~/app/filters";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { Session } from "~/app/types";
import { classNames, sessionToShortString, sessionToString } from "~/app/utils";

const SESSIONS: Session[] = [
  { year: "2025", semester: "summer" },
  { year: "2025", semester: "spring" },
  { year: "2024", semester: "fall" },
  { year: "2024", semester: "summer" },
  { year: "2024", semester: "spring" },
  { year: "2023", semester: "fall" },
  { year: "2023", semester: "summer" },
  { year: "2023", semester: "spring" },
  { year: "2022", semester: "fall" },
  { year: "2022", semester: "summer" },
  { year: "2022", semester: "spring" },
  { year: "2021", semester: "fall" },
  { year: "2021", semester: "summer" },
  { year: "2021", semester: "spring" },
  { year: "2020", semester: "fall" },
];

const SemestersOfferedFilter = () => {
  const dispatch = useAppDispatch();

  const { active, sessions } = useAppSelector(
    (state) => state.filters.semesters
  );

  const setSessions = (semesters: Session[]) => {
    dispatch(filtersSlice.actions.updateSemesters(semesters));

    // if there are any, enable the filter
    dispatch(filtersSlice.actions.updateSemestersActive(semesters.length > 0));
  };

  const deleteSession = (session: Session) => {
    dispatch(filtersSlice.actions.deleteSemester(session));

    // if there are none left, disable the filter
    if (sessions.length === 1) {
      dispatch(filtersSlice.actions.updateSemestersActive(false));
    }
  };

  const clearSemesters = () => {
    dispatch(filtersSlice.actions.resetSemesters());
    dispatch(filtersSlice.actions.updateSemestersActive(false));
  }

  return (
    <div className="relative mt-1">
      <Listbox value={sessions} onChange={setSessions} multiple>
        <Listbox.Label className="flex">
          <div>
            <input
              type="checkbox"
              className="mr-2"
              checked={active}
              onChange={(e) => {
                dispatch(
                  filtersSlice.actions.updateSemestersActive(e.target.checked)
                );
              }}
            />
          </div>
          Offered in
        </Listbox.Label>
        <div className="flex flex-row gap-x-2">

          <Listbox.Button className="border-gray-200 relative mt-2 w-full cursor-default rounded border py-1 pl-1 pr-10 text-left transition duration-150 ease-in-out sm:text-sm sm:leading-5">
            <span className="flex flex-wrap gap-1">
              {sessions.length === 0 ? (
                <span className="p-0.5">None</span>
              ) : (
                sessions.map((session) => (
                  <span
                    key={sessionToShortString(session)}
                    className="text-yellow-800 bg-yellow-50 flex items-center gap-1 rounded px-2 py-0.5"
                  >
                    <span>{sessionToString(session)}</span>
                    <XMarkIcon
                      className="h-3 w-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        deleteSession(session);
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

          <button
            className="rounded border border-gray-200 size-[calc(2rem+2px)] mb-auto mt-2 justify-center items-center flex"
            onClick={clearSemesters}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="bg-white absolute mt-1 w-full rounded shadow-lg">
          <Listbox.Options className="shadow-xs bg-white relative z-50 max-h-60 overflow-auto rounded py-1 text-base leading-6 focus:outline-none sm:text-sm sm:leading-5">
            {SESSIONS.map((session) => (
              <Listbox.Option
                key={sessionToShortString(session)}
                value={session}
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
                      <span
                        className={classNames(
                          "text-gray-700 ml-1",
                          selected ? "font-semibold" : "font-normal"
                        )}
                      >
                        {sessionToString(session)}
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

export default SemestersOfferedFilter;
