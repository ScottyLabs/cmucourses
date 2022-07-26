import React, { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { throttledFilter } from "../app/store";
import { SearchIcon, XIcon } from "@heroicons/react/solid";
import { userSlice } from "../app/user";
import { getCourseIDs } from "../app/utils";
import { cacheSlice } from "../app/cache";
import { filtersSlice } from "../app/filters";

const AppliedFiltersPill = ({
  className,
  children,
  onDelete,
}: {
  className: string;
  children: React.ReactNode;
  onDelete?: () => void;
}) => {
  return (
    <div
      className={`${className} flex flex-initial items-center rounded-md py-1 px-2 text-sm`}
    >
      <span>{children}</span>
      {onDelete && (
        <XIcon
          className="ml-2 h-3 w-3 cursor-pointer"
          onClick={(e) => {
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
      >
        {filter.units.min}-{filter.units.max} Units
      </AppliedFiltersPill>
    );
  }

  return (
    <>
      {badges.length > 0 && (
        <>
          <div className="mb-2 text-sm">Applied Filters</div>
          <div className="flex flex-wrap gap-x-1 gap-y-1.5">{badges}</div>
        </>
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

  return (
    <>
      <div className="text-gray-500 relative flex border-b border-b-gray-300 dark:border-b-zinc-500">
        <span className="absolute inset-y-0 left-0 flex items-center">
          <SearchIcon className="h-5 w-5" />
        </span>
        <input
          autoFocus
          className="text-gray-500 flex-1 py-2 pl-7 text-xl placeholder-gray-300 bg-transparent focus:outline-none dark:placeholder-zinc-700"
          type="search"
          value={search}
          onChange={onChange}
          placeholder="Search courses by ID, description, name or keyword..."
        />
      </div>
      <div className="text-gray-500 mt-3 flex justify-end">
        <div className="mr-6">Show</div>
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
      <div className="text-gray-500">
        <AppliedFilters />
      </div>
    </>
  );
};

export default SearchBar;
