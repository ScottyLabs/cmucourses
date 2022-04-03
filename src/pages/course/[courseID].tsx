import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { fetchCourseInfo } from "../../app/courses";
import CourseDetail from "../../components/CourseDetail";
import { CircularProgress } from "@mui/material";
import Sidebar from "../../components/Sidebar";
import Aggregate from "../../components/Aggregate";
import BookmarkedData from "../../components/BookmarkedData";
import BookmarkedList from "../../components/BookmarkedList";

const CourseDetailPage: NextPage = () => {
  const router = useRouter();
  const { courseID } = router.query;
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      const result = await fetchCourseInfo({ courseID, schedules: true });
      console.log(result);
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
        <div className="relative w-full mt-28 md:mt-16 lg:w-96 md:w-72">
          <Sidebar>
            <Aggregate />
          </Sidebar>
        </div>
        <div className="flex-1 overflow-y-scroll md:h-full md:pt-16">
          <CourseDetail info={info} />
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
