import React from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { Page } from "../../components/Page";
import InstructorDetail from "../../components/InstructorDetail";
import Aggregate from "../../components/Aggregate";
import CourseFilter from "../../components/filters/CourseFilter";

const InstructorPage: NextPage = () => {
  const router = useRouter();
  const name = router.query.name as string;

  return (
    <Page
      content={<InstructorDetail name={name} showLoading={true} />}
      sidebar={
        <>
          <Aggregate />
          <CourseFilter name={name} />
        </>}
    />
  );
};

export default InstructorPage;
