import React, { Component, useMemo } from "react";
import { useDispatch, useSelector, RootStateOrAny } from "react-redux";
import { throttledFilter } from "../app/store";
import { SearchIcon } from "@heroicons/react/solid";

const SearchBar = () => {
  const dispatch = useDispatch();

  const onChange = (e) => {
    dispatch({ type: "user/updateSearch", payload: e.target.value });
    throttledFilter();
  };

  const loggedIn = useSelector(
    (state: RootStateOrAny) => state.user.loggedIn
  );

  const setShowFCEs = (e) => {
    dispatch({ type: "user/showFCEs", payload: e.target.checked });
  };

  return (
    <div className="sticky top-0 z-10 p-8 bg-white text-zinc-700 drop-shadow-lg">
      <div className="flex">
        <div className="flex-1 text-lg">Course Search</div>
        <div className="mr-6">
          <input
            type="checkbox"
            className="mr-2"
            disabled={!loggedIn}
            onChange={setShowFCEs}
          ></input>
          <span>FCEs</span>
        </div>
        <div>
          <input type="checkbox" className="mr-2"></input>
          <span>Course Info</span>
        </div>
      </div>

      <div className="relative flex border-b rounded-md">
        <span className="absolute inset-y-0 left-0 flex items-center">
          <SearchIcon className="w-5 h-5" />
        </span>
        <input
          className="flex-1 py-2 text-xl pl-7 focus:outline-none bg-none"
          type="search"
          onChange={onChange}
          placeholder="Search by Course ID, description, name or keyword..."
        />
      </div>
      <div className="mt-3 text-zinc-500">
        <div className="text-sm">Applied Filters</div>
      </div>
    </div>
  );
};

export default SearchBar;
