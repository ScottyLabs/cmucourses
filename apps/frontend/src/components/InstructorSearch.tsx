import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import React from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { instructorsSlice } from "~/app/instructors";
import { cacheSlice } from "~/app/cache";
import { throttledInstructorFilter } from "~/app/store";

const InstructorSearch = () => {
  const dispatch = useAppDispatch();
  const page = useAppSelector((state) => state.cache.instructorPage);
  const search = useAppSelector((state) => state.instructors.search);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(instructorsSlice.actions.updateSearch(e.target.value));
    if (page !== 1) dispatch(cacheSlice.actions.setInstructorPage(1));
    throttledInstructorFilter();
  };

  const results = useAppSelector((state) => state.cache.selectedInstructors);
  const numResults = results.length;

  return (
    <>
      <div className="relative flex border-b border-b-gray-500 text-gray-500 dark:border-b-zinc-400 dark:text-zinc-300">
        <span className="absolute inset-y-0 left-0 flex items-center">
          <MagnifyingGlassIcon className="h-5 w-5" />
        </span>
        <input
          autoFocus
          className="flex-1 py-2 pl-7 text-xl placeholder-gray-300 bg-transparent focus:outline-none dark:placeholder-zinc-500"
          type="search"
          value={search}
          onChange={onChange}
          placeholder="Search instructors by name..."
        />
      </div>
      <div className="flex justify-between">
        <div className="mt-3 text-sm text-gray-400">{numResults} results</div>
      </div>
    </>
  );
};

export default InstructorSearch;
