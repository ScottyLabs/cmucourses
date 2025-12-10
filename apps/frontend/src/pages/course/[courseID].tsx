import React, { useEffect, useState } from "react";
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

  const [courseTitle, setCourseTitle] = useState("CMU Courses");

  // Dynamic title update logic
  useEffect(() => {
    if (!courseID) return;

    async function fetchCourse() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/course/${courseID}`
        );
        const data = await res.json();

        const name = data?.name || "";
        const number = data?.number || courseID;

        document.title = `${number}: ${name} | CMU Courses`;
        setCourseTitle(`${number}: ${name}`);
      } catch (err) {
        console.error("Failed to fetch course", err);
      }
    }


    fetchCourse();
  }, [courseID]);


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
