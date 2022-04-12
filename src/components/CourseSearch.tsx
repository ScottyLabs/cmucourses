import React, { ReactElement } from "react";
import CourseList from "./CourseList";
import SearchBar from "./SearchBar";
import Filter from "./Filter";
import Aggregate from "./Aggregate";
import Sidebar from "./Sidebar";

interface Props {}

export default function CourseSearch({}: Props): ReactElement {
  return (
    <div className="font-sans accent-purple-600">
      <div className="flex flex-col md:h-screen md:flex-row">
        <div className="relative mt-28 w-full md:mt-16 md:w-72 lg:w-96">
          <Sidebar>
            <Filter />
            <Aggregate />
          </Sidebar>
        </div>
        <div className="flex-1 overflow-y-scroll bg-grey-50 dark:bg-grey-800 md:h-full md:pt-16">
          <SearchBar />
          <CourseList />
        </div>
      </div>
    </div>
  );
}
