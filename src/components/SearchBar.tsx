import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { throttledFilter } from "../app/store";
import { SearchIcon } from "@heroicons/react/solid";
import { userSlice } from "../app/user";

const AppliedFilters = () => {
  const badges = [];
  const filter = useAppSelector(state => state.user.filter);

  filter.departments.forEach(department => {
    badges.push(
      <div className="py-1 px-2 bg-blue-50 text-blue-700 rounded-md text-sm">{`Department: ${department}`}</div>,
    );
  });

  return <>
    <div className="text-sm mb-2">Applied Filters</div>
    <div className="flex space-x-1">{badges}</div>
  </>;
};

const SearchBar = () => {
  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.user.filter.search);

  const onChange = (e) => {
    dispatch(userSlice.actions.updateSearch(e.target.value));
    throttledFilter();
  };

  useEffect(() => {
    dispatch(userSlice.actions.updateSearch(search));
    throttledFilter();
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
    <div className="sticky top-0 z-10 p-8 bg-white dark:bg-grey-900 text-grey-700 dark:text-grey-100 drop-shadow-md">
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
          <SearchIcon className="w-5 h-5" />
        </span>
        <input
          className="flex-1 py-2 text-xl pl-7 focus:outline-none bg-transparent text-grey-500 dark:text-grey-200"
          type="search"
          value={search}
          onChange={onChange}
          placeholder="Search by Course ID, description, name or keyword..."
        />
      </div>
      <div className="mt-3 text-grey-500">
        <AppliedFilters />
      </div>
    </div>
  );
};

export default SearchBar;
