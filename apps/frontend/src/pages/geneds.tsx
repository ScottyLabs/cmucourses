import type { NextPage } from "next";
import React from "react";
import Aggregate from "~/components/Aggregate";
import { Page } from "~/components/Page";
import GenedsViewer from "~/components/GenedsViewer";

const GenedsPage: NextPage = () => {
  return (
    <Page
      activePage="geneds"
      sidebar={<Aggregate />}
      content={<GenedsViewer />}
    />
  );
};

export default GenedsPage;
