import React, { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { throttledFilter } from "../app/store";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { userSlice } from "../app/user";
import {
  getCourseIDs,
  sessionToShortString,
  sessionToString,
} from "../app/utils";
import { cacheSlice } from "../app/cache";
import { filtersSlice } from "../app/filters";
import { getPillboxes } from "./filters/LevelFilter";

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
            throttledFilter();
          }}
        />
      )}
    </div>
  );
};

const AppliedFilters = () => {
  const dispatch = useAppDispatch();
  const badges = [];
  const filter = useAppSelector((state) => state.filters);

  if (filter.departments.active) {
    filter.departments.names.forEach((department) => {
      badges.push(
        <AppliedFiltersPill
          className="text-blue-800 bg-blue-50"
          onDelete={() => {
            dispatch(filtersSlice.actions.deleteDepartment(department));
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
          }}
          key={`session-${sessionToShortString(session)}`}
        >
          {sessionToString(session)}
        </AppliedFiltersPill>
      );
    });

    if (filter.levels.active) {
      getPillboxes(filter.levels.bitfield).forEach(({ mask, content }) => {
        badges.push(
          <AppliedFiltersPill
            className="text-red-800 bg-red-50"
            onDelete={() => {
              dispatch(filtersSlice.actions.deleteLevel(mask));
            }}
            key={`session-${mask}`}
          >
            {content}
          </AppliedFiltersPill>
        );
      });
    }
  }

  return (
    <>
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-x-1 gap-y-1.5">{badges}</div>
      )}
    </>
  );
};

const SearchBar = () => {
  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.filters.search);

  const dispatchSearch = useCallback(
    (search: string) => {
      const exactCourses = getCourseIDs(search);
      if (exactCourses)
        dispatch(cacheSlice.actions.setExactResultsCourses(exactCourses));
      else dispatch(cacheSlice.actions.setExactResultsCourses([]));
      throttledFilter();
    },
    [dispatch]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(filtersSlice.actions.updateSearch(e.target.value));
  };

  useEffect(() => {
    dispatchSearch(search);
  }, [dispatchSearch, search]);

  const loggedIn = useAppSelector((state) => state.user.loggedIn);
  const showFCEs = useAppSelector((state) => state.user.showFCEs);
  const showCourseInfos = useAppSelector((state) => state.user.showCourseInfos);

  const setShowFCEs = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(userSlice.actions.showFCEs(e.target.checked));
  };

  const setShowCourseInfos = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(userSlice.actions.showCourseInfos(e.target.checked));
  };

  const numResults = useAppSelector((state) => state.cache.totalDocs);

  return (
    <>
      <div className="text-gray-500 relative flex border-b border-b-gray-500 dark:text-zinc-300 dark:border-b-zinc-400">
        <span className="absolute inset-y-0 left-0 flex items-center">
          <MagnifyingGlassIcon className="h-5 w-5" />
        </span>
        <input
          autoFocus
          className="flex-1 py-2 pl-7 text-xl placeholder-gray-300 bg-transparent focus:outline-none dark:placeholder-zinc-500"
          type="search"
          value={search}
          onChange={onChange}
          placeholder="Search courses by ID, description, name or keyword..."
        />
      </div>
      <div className="flex justify-between">
        <div className="text-gray-400 mt-3 text-sm">{numResults} results</div>
        <div className="text-gray-500 mt-3 flex justify-end">
          <div className="mr-6 hidden md:block">Show</div>
          <div className="mr-6">
            <input
              type="checkbox"
              className="mr-2"
              disabled={!loggedIn}
              onChange={setShowFCEs}
              checked={showFCEs}
            />
            <span>FCEs</span>
          </div>
          <div>
            <input
              type="checkbox"
              className="mr-2"
              onChange={setShowCourseInfos}
              checked={showCourseInfos}
            />
            <span>Course Info</span>
          </div>
        </div>
      </div>
      <div className="text-gray-500 mt-2">
        <AppliedFilters />
      </div>
    </>
  );
};

export default SearchBar;
