import type { NextPage } from "next";
import React, { Component } from "react";
import BookmarkedData from "../components/BookmarkedData";
import BookmarkedList from "../components/BookmarkedList";
import CourseList from "../components/CourseList";
import Filter from "../components/Filter";
import SearchBar from "../components/SearchBar";

const BookmarkedPage: NextPage = () => {
  return (
    <div className="font-sans accent-indigo-600">
      <div className="flex h-screen">
        <div className="relative mt-16 lg:w-96 w-72">
          <Filter />
        </div>
        <div className="flex-1 h-full pt-16 overflow-y-scroll">
          <BookmarkedData />
          <BookmarkedList />
        </div>
      </div>
    </div>
  );
};

export default BookmarkedPage;
