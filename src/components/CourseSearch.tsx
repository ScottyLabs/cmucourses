import React, { ReactElement } from "react";
import CourseList from "./CourseList";
import SearchBar from "./SearchBar";
import Filter from "./Filter";

interface Props {}

export default function CourseSearch({}: Props): ReactElement {
  return (
    <div className="font-sans accent-indigo-600">
      <div className="flex h-screen">
        <div className="relative mt-16 lg:w-96 w-72">
          <Filter />
        </div>
        <div className="flex-1 h-full pt-16 overflow-y-scroll">
          <SearchBar />
          <CourseList />
        </div>
      </div>
    </div>
  );
}
