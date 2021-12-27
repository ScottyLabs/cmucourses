import React, { Component, useMemo } from "react";
import { useDispatch } from "react-redux";
import { fetchCourseInfos } from "../app/courses";
import { throttledFilter } from "../app/store";
import { SearchIcon } from '@heroicons/react/solid';

const SearchBar = () => {
  const dispatch = useDispatch();

  const onChange = (e) => {
    dispatch({ type: "courses/updateSearch", payload: e.target.value });
    throttledFilter();
  };

  return (
    <div className="p-8 bg-white text-zinc-700 drop-shadow-lg sticky top-0 z-10">
      <div className="text-lg">Course Search</div>
      <div className="relative rounded-md flex border-b">
        <span className="absolute inset-y-0 left-0 flex items-center">
          <SearchIcon className="h-5 w-5" />
        </span>
        <input className="py-2 pl-7 text-xl focus:outline-none bg-none flex-1" type="search" onChange={onChange} placeholder="Search by Course ID, description, name or keyword..." />
      </div>
      <div className="mt-3 text-zinc-500">
        <div className="text-sm">Applied Filters</div>
      </div>
    </div>
  );
};

export default SearchBar;
