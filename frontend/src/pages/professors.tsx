import type { NextPage } from "next";
import Topbar from "../components/Topbar";
import ProfessorSearch from "../components/ProfessorSearch";
import ProfessorSearchList from "../components/ProfessorSearchList";
import React from "react";
import { Page } from "../components/Page";

const ProfessorsPage: NextPage = () => {
  return (
    <Page
      sidebar={
        <>
          <b>Work in progress</b>
          {/*<Filter />*/}
          {/*<Aggregate />*/}
        </>
      }
      content={
        <>
          <Topbar>
            <ProfessorSearch />
          </Topbar>
          <ProfessorSearchList />
        </>
      }
      activePage="professors"
    />
  );
};

export default ProfessorsPage;
