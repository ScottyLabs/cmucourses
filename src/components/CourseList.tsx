import React, { useState, useEffect } from "react";
import { useSelector, useDispatch, RootStateOrAny } from "react-redux";
import CourseCard from "./CourseCard";
import { Pagination } from "react-headless-pagination";
import { fetchCourseInfos, fetchFCEInfos } from "../app/courses";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline";

const CoursePage = () => {
  const dispatch = useDispatch();
  const results = useSelector((state: RootStateOrAny) => state.courses.results);

  const loggedIn = useSelector(
    (state: RootStateOrAny) => state.courses.loggedIn
  );

  useEffect(() => {
    if (loggedIn) {
      dispatch(
        fetchFCEInfos({ courseIDs: results.map((course) => course.courseID) })
      );
    }
  }, [results, loggedIn]);

  return (
    <div className="space-y-4">
      {results &&
        results.map((course) => (
          <CourseCard info={course} key={course.courseID} />
        ))}
    </div>
  );
};

const CourseList = () => {
  const pages = useSelector(
    (state: RootStateOrAny) => state.courses.totalPages
  );
  const curPage = useSelector((state: RootStateOrAny) => state.courses.page);

  const dispatch = useDispatch();

  const handlePageClick = (page) => {
    dispatch(fetchCourseInfos(page + 1));
  };

  useEffect(() => {
    if (window.localStorage.getItem("course_token")) {
      dispatch({ type: "courses/logIn" });
    }
  }, []);

  return (
    <div className="p-6">
      <CoursePage />
      <div className="mx-auto my-6">
        <Pagination
          currentPage={curPage - 1}
          setCurrentPage={handlePageClick}
          totalPages={pages}
          className="flex justify-center w-full"
        >
          <Pagination.PrevButton className="">
            <ChevronLeftIcon className="w-5 h-5" />
          </Pagination.PrevButton>

          <div className="flex items-center align-baseline">
            <Pagination.PageButton
              activeClassName="bg-zinc-200"
              inactiveClassName=""
              className="inline-flex items-center justify-center w-8 h-8 mx-3 rounded-full hover:bg-white hover:cursor-pointer"
            />
          </div>

          <Pagination.NextButton>
            <ChevronRightIcon className="w-5 h-5" />
          </Pagination.NextButton>
        </Pagination>
      </div>
    </div>
  );
};

export default CourseList;
