import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { throttledFilter } from "../app/store";
import { SearchIcon } from "@heroicons/react/solid";
import { userSlice } from "../app/user";
import { isExactSearch } from "../app/utils";
import { coursesSlice } from "../app/courses";

const AppliedFilters = () => {
  const badges = [];
  const filter = useAppSelector((state) => state.user.filter);

  filter.departments.forEach((department) => {
    badges.push(
      <div className="rounded-md bg-blue-50 py-1 px-2 text-sm text-blue-700 dark:bg-blue-700 dark:text-blue-50">{`Department: ${department}`}</div>
    );
  });

  return (
    <>
      <div className="mb-2 text-sm">Applied Filters</div>
      <div className="flex space-x-1">{badges}</div>
    </>
  );
};

const SearchBar = () => {
  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.user.filter.search);

  const dispatchSearch = (search) => {
    dispatch(userSlice.actions.updateSearch(search));
    dispatch(coursesSlice.actions.setExactResultsActive(isExactSearch(search)));
    throttledFilter();
  };

  const onChange = (e) => {
    dispatchSearch(e.target.value);
  };

  useEffect(() => {
    dispatchSearch(search);
  }, []);

  const loggedIn = useAppSelector((state) => state.user.loggedIn);
  const showFCEs = useAppSelector((state) => state.user.showFCEs);
  const showCourseInfos = useAppSelector((state) => state.user.showCourseInfos);
  const setShowFCEs = (e) => {
    dispatch(userSlice.actions.showFCEs(e.target.checked));
  };

  const setShowCourseInfos = (e) => {
    dispatch(userSlice.actions.showCourseInfos(e.target.checked));
  };

  return (
    <div className="sticky top-0 z-10 bg-white p-8 text-grey-700 drop-shadow-md dark:bg-grey-900 dark:text-grey-100">
      <div className="flex">
        <div className="flex-1 text-lg">Course Search</div>
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

      <div className="relative flex border-b border-b-grey-300">
        <span className="absolute inset-y-0 left-0 flex items-center">
          <SearchIcon className="h-5 w-5" />
        </span>
        <input
          className="flex-1 bg-transparent py-2 pl-7 text-xl text-grey-500 focus:outline-none dark:text-grey-200"
          type="search"
          value={search}
          onChange={onChange}
          placeholder="Search by Course ID, description, name or keyword..."
        />
      </div>
      <div className="mt-3 text-grey-500 dark:text-grey-300">
        <AppliedFilters />
      </div>
    </div>
  );
};

export default SearchBar;
