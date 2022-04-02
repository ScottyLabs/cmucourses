import type { NextPage } from "next";
import React from "react";
import BookmarkedData from "../components/BookmarkedData";
import BookmarkedList from "../components/BookmarkedList";
import Filter from "../components/Filter";

const BookmarkedPage: NextPage = () => {
  return (
    <div className="font-sans accent-indigo-600">
      <div className="flex flex-col md:h-screen md:flex-row">
        <div className="relative w-full mt-28 md:mt-16 lg:w-96 md:w-72">
          <Filter />
        </div>
        <div className="flex-1 overflow-y-scroll md:h-full md:pt-16">
          <BookmarkedData />
          <BookmarkedList />
        </div>
      </div>
    </div>
  );
};

export default BookmarkedPage;
