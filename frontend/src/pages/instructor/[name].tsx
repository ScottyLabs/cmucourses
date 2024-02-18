import React from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { Page } from "../../components/Page";
import InstructorDetail from "../../components/InstructorDetail";
import Aggregate from "../../components/Aggregate";

const InstructorPage: NextPage = () => {
  const router = useRouter();
  const name = router.query.name as string;

  return (
    <Page content={<InstructorDetail name={name} showLoading={true} />} sidebar={<Aggregate />} />
  );
};

export default InstructorPage;
