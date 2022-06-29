import React, { useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import {
  fetchCourseInfo,
  selectCourseResult,
  selectScheduleForCourse,
} from "../../app/courses";
import CourseDetail from "../../components/CourseDetail";
import Sidebar from "../../components/Sidebar";
import Aggregate from "../../components/Aggregate";
import Loading from "../../components/Loading";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

const CourseDetailPage: NextPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const courseID = router.query.courseID as string;
  const info = useAppSelector(selectCourseResult(courseID));
  const schedules = useAppSelector(selectScheduleForCourse(courseID));

  useEffect(() => {
    if (courseID) dispatch(fetchCourseInfo({ courseID, schedules: true }));
  }, [dispatch, courseID]);

  if (!info) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex flex-col md:h-screen md:flex-row">
        <div className="relative mt-28 w-full md:mt-16 md:w-72 lg:w-96">
          <Sidebar>
            <Aggregate />
          </Sidebar>
        </div>
        <div className="flex-1 overflow-y-scroll md:h-full md:pt-16">
          <CourseDetail info={info} schedules={schedules} />
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
