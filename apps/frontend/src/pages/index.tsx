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
            <div className="flex w-full items-center gap-3">
              <div className="flex-1">
                <SearchBar />
              </div>

              <a
                href="/requisites"
                className="shrink-0 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Course Requisites Graph
              </a>
            </div>
          </Topbar>

          <CourseSearchList />
        </>
      }
      activePage="search"
    />
  );
};


export default IndexPage;
