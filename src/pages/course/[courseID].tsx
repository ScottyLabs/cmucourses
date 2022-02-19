import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { fetchCourseInfo } from "../../app/courses";
import CourseDetail from "../../components/CourseDetail";
import { CircularProgress } from "@mui/material";

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
    <div className="mt-16">
      <CourseDetail info={info} />
    </div>
  );
};

export default CourseDetailPage;
