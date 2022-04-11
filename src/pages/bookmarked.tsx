import type { NextPage } from "next";
import React from "react";
import BookmarkedData from "../components/BookmarkedData";
import BookmarkedList from "../components/BookmarkedList";
import Sidebar from "../components/Sidebar";
import Aggregate from "../components/Aggregate";

const BookmarkedPage: NextPage = () => {
  return (
    <div className="font-sans accent-purple-600">
      <div className="flex flex-col md:h-screen md:flex-row">
        <div className="relative w-full mt-28 md:mt-16 lg:w-96 md:w-72">
          <Sidebar>
            <Aggregate />
          </Sidebar>
        </div>
        <div className="flex-1 overflow-y-scroll md:h-full md:pt-16 dark:bg-grey-800">
          <BookmarkedData />
          <BookmarkedList />
        </div>
      </div>
    </div>
  );
};

export default BookmarkedPage;
