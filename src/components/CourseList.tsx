import React, { useState } from "react";
import { useSelector, useDispatch, RootStateOrAny } from "react-redux";
import Course from "./Course";
import { Pagination } from "@mui/material";
import { Stack } from "@mui/material";
import { fetchCourseInfos } from "../app/courses";

const CoursePage = () => {
  const results = useSelector((state: RootStateOrAny) => state.courses.results);

  return (
    <Stack spacing={2}>
      {results.map((course) => (
        <Course info={course} key={course.courseID} />
      ))}
    </Stack>
  );
};

const CourseList = () => {

  const pages = useSelector((state: RootStateOrAny) => state.courses.totalPages);
  const curPage = useSelector((state: RootStateOrAny) => state.courses.page);

  const dispatch = useDispatch();

  const handlePageClick = (event, page) => {
    dispatch(fetchCourseInfos(page));
  }

  return (
    <Stack spacing={2} alignItems="center" >
      <CoursePage />
      <Pagination
        onChange={(handlePageClick)}
        count={pages}
        page={curPage}
      />
    </Stack>
  );
};

export default CourseList;
