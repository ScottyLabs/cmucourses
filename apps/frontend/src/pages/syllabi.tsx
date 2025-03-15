import type { NextPage } from "next";
import Topbar from "~/components/Topbar";
import React from "react";
import { Page } from "~/components/Page";
import Aggregate from "~/components/Aggregate";
import SyllabiSearch from "~/components/SyllabiSearchList";

const SyllabiPage: NextPage = () => {
  return (
    <Page
      content={
        <>
            <SyllabiSearch />
        </>
      }
      activePage="syllabi"
    />
  );
};

export default SyllabiPage;