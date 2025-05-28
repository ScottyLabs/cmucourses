import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { throttledFilter } from "~/app/store";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { userSlice } from "~/app/user";
import {
  getCourseIDs,
  sessionToShortString,
  sessionToString,
  standardizeIdsInString,
} from "~/app/utils";
import { filtersSlice } from "~/app/filters";
import { getPillboxes } from "./filters/LevelFilter";
import { useFetchCourseInfosByPage } from "~/app/api/course";
import { useAuth } from "@clerk/nextjs";

const AppliedFiltersPill = ({
  className,
  children,
  onDelete,
}: {
  className: string;
  children: React.ReactNode;
  onDelete?: () => void;
  key: string;
}) => {
  return (
    <div
      className={`${className} flex flex-initial items-center rounded py-1 px-2 text-sm`}
    >
      <span>{children}</span>
      {onDelete && (
        <XMarkIcon
          className="ml-2 h-3 w-3 cursor-pointer"
          onClick={() => {
            onDelete();
          }}
        />
      )}
    </div>
  );
};

const AppliedFilters = () => {
  const dispatch = useAppDispatch();
  const badges: JSX.Element[] = [];
  const filter = useAppSelector((state) => state.filters);

  if (filter.departments.active) {
    filter.departments.names.forEach((department) => {
      badges.push(
        <AppliedFiltersPill
          className="text-blue-800 bg-blue-50"
          onDelete={() => {
            dispatch(filtersSlice.actions.deleteDepartment(department));

            // if there are none left, disable the filter
            if (filter.departments.names.length === 1) {
              dispatch(filtersSlice.actions.updateDepartmentsActive(false));
            }
          }}
          key={`department-${department}`}
        >
          {department}
        </AppliedFiltersPill>
      );
    });
  }

  if (filter.units.active) {
    badges.push(
      <AppliedFiltersPill
        className="text-teal-700 bg-teal-50"
        onDelete={() => {
          dispatch(filtersSlice.actions.updateUnitsActive(false));
        }}
        key="units"
      >
        {filter.units.min}-{filter.units.max} Units
      </AppliedFiltersPill>
    );
  }

  if (filter.semesters.active) {
    filter.semesters.sessions.forEach((session) => {
      badges.push(
        <AppliedFiltersPill
          className="text-yellow-800 bg-yellow-50"
          onDelete={() => {
            dispatch(filtersSlice.actions.deleteSemester(session));

            // if there are none left, disable the filter
            if (filter.semesters.sessions.length === 1) {
              dispatch(filtersSlice.actions.updateSemestersActive(false));
            }
          }}
          key={`session-${sessionToShortString(session)}`}
        >
          {sessionToString(session)}
        </AppliedFiltersPill>
      );
    });
  }

  if (filter.levels.active) {
    getPillboxes(filter.levels.selected).forEach(({ levels, content }) => {
      badges.push(
        <AppliedFiltersPill
          className="text-red-800 bg-red-50"
          onDelete={() => {
            dispatch(filtersSlice.actions.deleteLevel(levels));

            // levels is what was removed,
            // filter.levels.selected is what was there before (as a list of booleans)
            // if only the contents of levels were true in filter.levels.selected,
            // then we should disable the filter
            for (let i = 0; i < 10; i++) {
              if (levels.includes(i) !== filter.levels.selected[i]) {
                return;
              }
            }

            dispatch(filtersSlice.actions.updateLevelsActive(false));
          }}
          key={`session-${levels.toString()}`}
        >
          {content}
        </AppliedFiltersPill>
      );
    });
  }

  return (
    <div className="flex justify-between">
      {badges.length > 0 && (
        <>
          <div className="flex flex-wrap gap-x-1 gap-y-1.5">{badges}</div>
          <div
            className="text-sm text-gray-700 hover:text-blue-500 underline cursor-pointer"
            onClick={() => {
              dispatch(filtersSlice.actions.resetFilters());
            }}
          >
            reset
          </div>
        </>
      )}
    </div>
  );
};

const SearchBar = () => {
  const dispatch = useAppDispatch();
  const initialSearch = useAppSelector((state) => state.filters.search);
  const [search, setSearch] = useState(initialSearch);

  const dispatchSearch = useCallback(
    (search: string) => {
      const exactCourses = getCourseIDs(search);
      if (exactCourses)
        dispatch(filtersSlice.actions.setExactResultsCourses(exactCourses));
      else dispatch(filtersSlice.actions.setExactResultsCourses([]));
    },
    [dispatch]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(standardizeIdsInString(e.target.value));
    throttledFilter(e.target.value);
  };

  useEffect(() => {
    dispatchSearch(search);
  }, [dispatchSearch, search]);

  const { isSignedIn } = useAuth();
  const showFCEs = useAppSelector((state) => state.user.showFCEs);
  const showCourseInfos = useAppSelector((state) => state.user.showCourseInfos);
  const showSchedules = useAppSelector((state) => state.user.showSchedules);

  const showAll = useAppSelector((state) => state.user.showAll);

  const showAllRef = useRef<any>(null);
  useEffect(() => {
    if (showAllRef.current) {
      if (isSignedIn) {
        if (showFCEs && showCourseInfos && showSchedules) {
          showAllRef.current.indeterminate = false;
          showAllRef.current.checked = true;
        } else if (!(showFCEs || showCourseInfos || showSchedules)) {
          showAllRef.current.indeterminate = false;
          showAllRef.current.checked = false;
        } else showAllRef.current.indeterminate = true;
      } else {
        if (showCourseInfos && showSchedules) {
          showAllRef.current.indeterminate = false;
          showAllRef.current.checked = true;
        } else if (!(showCourseInfos || showSchedules)) {
          showAllRef.current.indeterminate = false;
          showAllRef.current.checked = false;
        } else showAllRef.current.indeterminate = true;
      }
    }
  }, [showAllRef, isSignedIn, showFCEs, showCourseInfos, showSchedules]);

  const setShowFCEs = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(userSlice.actions.showFCEs(e.target.checked));
  };

  const setShowCourseInfos = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(userSlice.actions.showCourseInfos(e.target.checked));
  };

  const setShowSchedules = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(userSlice.actions.showSchedules(e.target.checked));
  };

  const setShowAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(userSlice.actions.showAll(e.target.checked));
    if (isSignedIn) dispatch(userSlice.actions.showFCEs(e.target.checked));
    dispatch(userSlice.actions.showCourseInfos(e.target.checked));
    dispatch(userSlice.actions.showSchedules(e.target.checked));
  };

  const { data: { totalDocs: numResults } = {} } = useFetchCourseInfosByPage();

  return (
    <>
      <div className="relative flex border-b border-b-gray-500 text-gray-500 dark:border-b-zinc-400 dark:text-zinc-600">
        <span className="absolute inset-y-0 left-0 flex items-center">
          <MagnifyingGlassIcon className="h-5 w-5" />
        </span>
        <input
          autoFocus
          className="[&::-webkit-search-cancel-button]:appearance-none flex-1 py-2 pl-7 pr-7 text-xl placeholder-gray-300 bg-transparent focus:outline-none dark:placeholder-zinc-500"
          type="search"
          value={search}
          onChange={onChange}
          placeholder="Search courses by ID, description, name, or keyword..."
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute inset-y-0 right-0 flex items-center text-gray-500 hover:text-gray-700 dark:text-zinc-600 dark:hover:text-zinc-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="flex justify-between">
        <div className="mt-3 text-sm text-gray-500">
          {numResults || 0} results
        </div>
        <div className="mt-3 grid grid-flow-row-dense grid-cols-2 text-gray-500 text-sm md:flex md:justify-end">
          <div className="mr-2 md:mr-6">
            <input
              id="selectAll"
              type="checkbox"
              className="mr-2"
              onChange={setShowAll}
              checked={showAll}
              ref={showAllRef}
            />
            <span>All</span>
          </div>
          <div className="mr-2 md:mr-6">
            <input
              type="checkbox"
              className="mr-2"
              disabled={!isSignedIn}
              onChange={setShowFCEs}
              checked={showFCEs}
            />
            <span>FCEs</span>
          </div>
          <div className="mr-2 md:mr-6">
            <input
              type="checkbox"
              className="mr-2"
              onChange={setShowCourseInfos}
              checked={showCourseInfos}
            />
            <span>Course&nbsp;Info</span>
          </div>
          <div className="mr-2 md:mr-6">
            <input
              type="checkbox"
              className="mr-2"
              onChange={setShowSchedules}
              checked={showSchedules}
            />
            <span>Schedules</span>
          </div>
        </div>
      </div>
      <div className="mt-2 text-gray-500">
        <AppliedFilters />
      </div>
    </>
  );
};

export default SearchBar;
