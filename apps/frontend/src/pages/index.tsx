import type { NextPage } from "next";
import Link from "next/link";
import Filter from "~/components/Filter";
import Aggregate from "~/components/Aggregate";
import Topbar from "~/components/Topbar";
import SearchBar from "~/components/SearchBar";
import CourseSearchList from "~/components/CourseSearchList";
import React from "react";
import { Page } from "~/components/Page";


const IndexPage: NextPage = () => {
  return (
    <Page
      sidebar={
        <>
          <Filter />
          <Aggregate />
        </>
      }
      content={
        <>
          <Topbar>
            <SearchBar />
          </Topbar>

          <div className="px-4 pt-4 pb-2">
      <div className="border rounded-xl p-4 bg-white flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold">Course Requisites Graph</h2>
          <p className="text-sm text-gray-600">
            Explore a full DAG of all CMU course prerequisites and postrequisites.
          </p>
        </div>
        <Link
          href="/requisites"
          className="mt-2 inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 md:mt-0"
        >
          Open graph
        </Link>
      </div>
    </div>
          <CourseSearchList />
        </>
      }
      activePage="search"
    />
  );
};

export default IndexPage;
