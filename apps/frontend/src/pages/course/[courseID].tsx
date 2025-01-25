import React from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import CourseDetail from "~/components/CourseDetail";
import Aggregate from "~/components/Aggregate";
import Loading from "~/components/Loading";
import { Page } from "~/components/Page";
import InstructorFilter from "~/components/filters/InstructorFilter";

const CourseDetailPage: NextPage = () => {
  const router = useRouter();
  const courseID = router.query.courseID as string;

  let content = (
    <div className="p-6">
      <Loading />
    </div>
  );

  if (courseID) {
    content = <CourseDetail courseID={courseID} />;
  }

  return (
    <Page
      content={content}
      sidebar={
        <>
          <Aggregate />
          <InstructorFilter courseID={courseID} />
        </>
      }
    />
  );
};

export default CourseDetailPage;
