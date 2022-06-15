import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { throttledFilter } from "../app/store";
import { SearchIcon } from "@heroicons/react/solid";
import { userSlice } from "../app/user";
import { getCourseIds } from "../app/utils";
import { coursesSlice } from "../app/courses";

const AppliedFilters = () => {
  const badges = [];
  const filter = useAppSelector((state) => state.user.filter);

  filter.departments.forEach((department) => {
    badges.push(
      <div className="text-blue-800 bg-blue-50 flex-initial rounded-md py-1 px-2 text-sm">{`Department: ${department}`}</div>
    );
  });

  return (
    <>
      <div className="mb-2 text-sm">Applied Filters</div>
      <div className="flex flex-wrap gap-x-1 gap-y-1.5">{badges}</div>
    </>
  );
};

const SearchBar = () => {
  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.user.filter.search);
  const exactMatchesOnly = useAppSelector(
    (state) => state.user.filter.exactMatchesOnly
  );

  const dispatchSearch = (search) => {
    dispatch(userSlice.actions.updateSearch(search));
    const exactCourses = getCourseIds(search);
    if (exactCourses)
      dispatch(coursesSlice.actions.setExactResultsCourses(exactCourses));
    else dispatch(coursesSlice.actions.setExactResultsCourses([]));
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
    <div className="bg-white text-gray-700 sticky top-0 z-10 p-8 drop-shadow-md">
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

      <div className="relative flex border-b border-b-gray-300 dark:border-b-zinc-600">
        <span className="absolute inset-y-0 left-0 flex items-center">
          <SearchIcon className="h-5 w-5" />
        </span>
        <input
          className="text-gray-500 flex-1 py-2 pl-7 text-xl placeholder-gray-400 bg-transparent focus:outline-none dark:text-zinc-300 dark:placeholder-zinc-500"
          type="search"
          value={search}
          onChange={onChange}
          placeholder="Search by Course ID, description, name or keyword..."
        />
      </div>
      <div className="text-gray-500 mt-3">
        <AppliedFilters />
      </div>
    </div>
  );
};

export default SearchBar;
