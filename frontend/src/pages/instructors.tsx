import type { NextPage } from "next";
import Topbar from "../components/Topbar";
import InstructorSearch from "../components/InstructorSearch";
import InstructorSearchList from "../components/InstructorSearchList";
import React from "react";
import { Page } from "../components/Page";
import Aggregate from "../components/Aggregate";

const InstructorsPage: NextPage = () => {
  return (
    <Page
      sidebar={
        <>
          <Aggregate />
        </>
      }
      content={
        <>
          <Topbar>
            <InstructorSearch />
          </Topbar>
          <InstructorSearchList />
        </>
      }
      activePage="instructors"
    />
  );
};

export default InstructorsPage;
