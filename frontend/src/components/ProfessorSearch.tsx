import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import React from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { professorsSlice } from "../app/professors";
import { cacheSlice } from "../app/cache";
import {selectProfessors} from "../app/cache";

const ProfessorSearch = () => {
  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.professors.search);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(professorsSlice.actions.updateSearch(e.target.value));
    dispatch(cacheSlice.actions.setProfessorPage(1));
  };

  const results = useAppSelector(selectProfessors(search));
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
          placeholder="Search professors by name..."
        />
      </div>
      <div className="flex justify-between">
        <div className="text-gray-400 mt-3 text-sm">{numResults} results</div>
      </div>
    </>
  );
};

export default ProfessorSearch;
