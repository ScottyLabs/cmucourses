import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { instructorsSlice } from "~/app/instructors";
import { throttledInstructorFilter } from "~/app/store";

const InstructorSearch = () => {
  const dispatch = useAppDispatch();
  const page = useAppSelector((state) => state.instructors.instructorPage);
  const numResults = useAppSelector((state) => state.instructors.numResults);
  const initialSearch = useAppSelector((state) => state.instructors.search);
  const [search, setSearch] = useState(initialSearch);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (page !== 1) dispatch(instructorsSlice.actions.setInstructorPage(1));
    throttledInstructorFilter(e.target.value);
  };

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
