import type { NextPage } from "next";
import React from "react";
import CourseList from "../components/CourseList";
import Sidebar from "../components/Sidebar";
import Aggregate from "../components/Aggregate";
import { useAppSelector } from "../app/hooks";

const SavedPage: NextPage = () => {
  const saved = useAppSelector((state) => state.user.bookmarked);

  return (
    <div className="font-sans accent-purple-600">
      <div className="flex flex-col md:h-screen md:flex-row">
        <div className="relative mt-28 w-full md:mt-16 md:w-72 lg:w-96">
          <Sidebar>
            <Aggregate />
          </Sidebar>
        </div>
        <div className="flex-1 overflow-y-scroll dark:bg-grey-800 md:h-full md:pt-16">
          <CourseList courseIDs={saved}>
            <div className="text-center font-semibold text-grey-500">
              Nothing bookmarked yet!
            </div>
          </CourseList>
        </div>
      </div>
    </div>
  );
};

export default SavedPage;
