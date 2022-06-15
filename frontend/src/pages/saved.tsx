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
        <div className="relative mt-28 w-full md:mt-16 md:w-72 lg:w-96">
          <Sidebar>
            <Aggregate />
          </Sidebar>
        </div>
        <div className="flex-1 overflow-y-scroll  md:h-full md:pt-16">
          <BookmarkedData />
          <BookmarkedList />
        </div>
      </div>
    </div>
  );
};

export default BookmarkedPage;
