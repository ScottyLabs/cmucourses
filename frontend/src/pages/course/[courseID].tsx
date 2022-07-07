import React, { useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import {
  fetchCourseInfo,
  selectCourseResult,
  selectScheduleForCourse,
} from "../../app/courses";
import CourseDetail from "../../components/CourseDetail";
import Aggregate from "../../components/Aggregate";
import Loading from "../../components/Loading";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { Page } from "../../components/Page";

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
    <Page
      content={<CourseDetail info={info} schedules={schedules} />}
      sidebar={<Aggregate />}
    />
  );
};

export default CourseDetailPage;
