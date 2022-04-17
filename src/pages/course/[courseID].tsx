import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { fetchCourseInfo } from "../../app/courses";
import CourseDetail from "../../components/CourseDetail";
import { CircularProgress } from "@mui/material";
import Sidebar from "../../components/Sidebar";
import Aggregate from "../../components/Aggregate";

const CourseDetailPage: NextPage = () => {
  const router = useRouter();
  const [info, setInfo] = useState(null);

  const courseID =
    typeof router.query.courseID === "string"
      ? router.query.courseID
      : router.query.courseID[0];

  useEffect(() => {
    const fetchInfo = async () => {
      const result = await fetchCourseInfo({ courseID, schedules: true });
      setInfo(result);
    };

    fetchInfo();
  }, [courseID]);

  if (!info) {
    return <CircularProgress />;
  }

  return (
    <div>
      <div className="flex flex-col md:h-screen md:flex-row">
        <div className="relative mt-28 w-full md:mt-16 md:w-72 lg:w-96">
          <Sidebar>
            <Aggregate />
          </Sidebar>
        </div>
        <div className="flex-1 overflow-y-scroll dark:bg-grey-800 md:h-full md:pt-16">
          <CourseDetail info={info} />
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
