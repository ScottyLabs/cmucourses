import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import CourseCard from "./CourseCard";
import { Pagination } from "react-headless-pagination";
import {
  fetchCourseInfosByPage,
  fetchFCEInfos,
  selectCourseResults,
} from "../app/courses";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline";
import Loading from "./Loading";

const CoursePage = () => {
  const dispatch = useAppDispatch();

  const pageCourses = useAppSelector((state) => state.courses.pageCourses);
  const page = useAppSelector((state) => state.courses.page);

  const exactResultsCourses = useAppSelector(
    (state) => state.courses.exactResultsCourses
  );
  const exactMatchesOnly = useAppSelector(
    (state) => state.user.filter.exactMatchesOnly
  );

  const showFCEs = useAppSelector((state) => state.user.showFCEs);
  const showCourseInfos = useAppSelector((state) => state.user.showCourseInfos);
  const loggedIn = useAppSelector((state) => state.user.loggedIn);

  let coursesToShow: string[] = [];

  if (exactMatchesOnly) {
    coursesToShow = [...exactResultsCourses];
  } else if (page === 1 && exactResultsCourses.length > 0) {
    coursesToShow = [
      ...exactResultsCourses,
      ...pageCourses.filter(
        (courseID) => !exactResultsCourses.includes(courseID)
      ),
    ];
  } else {
    coursesToShow = [...pageCourses];
  }

  const results = useAppSelector(selectCourseResults(coursesToShow));

  useEffect(() => {
    console.log(coursesToShow);
    if (loggedIn && coursesToShow) {
      dispatch(fetchFCEInfos({ courseIDs: coursesToShow }));
    }
  }, [coursesToShow.join(" "), loggedIn]);

  return (
    <div className="space-y-4">
      {results &&
        results.map((course) => (
          <CourseCard
            info={course}
            key={course.courseID}
            showFCEs={showFCEs}
            showCourseInfo={showCourseInfos}
          />
        ))}
    </div>
  );
};

const CourseSearchList = () => {
  const pages = useAppSelector((state) => state.courses.totalPages);
  const curPage = useAppSelector((state) => state.courses.page);

  const loading = useAppSelector((state) => state.courses.coursesLoading);
  const exactMatchesOnly = useAppSelector(
    (state) => state.user.filter.exactMatchesOnly
  );

  const dispatch = useAppDispatch();

  const handlePageClick = (page) => {
    dispatch(fetchCourseInfosByPage(page + 1));
  };

  return (
    <div className="p-6">
      {loading ? (
        <Loading />
      ) : (
        <>
          <CoursePage />
          {!exactMatchesOnly && (
            <div className="mx-auto my-6">
              <Pagination
                currentPage={curPage - 1}
                setCurrentPage={handlePageClick}
                totalPages={pages}
                className="text-grey-600 flex w-full justify-center"
              >
                <Pagination.PrevButton className="">
                  <ChevronLeftIcon className="dark:stroke-grey-50 h-5 w-5" />
                </Pagination.PrevButton>

                <div className="flex items-center align-baseline">
                  <Pagination.PageButton
                    activeClassName="bg-grey-100 dark:bg-grey-700"
                    inactiveClassName=""
                    className="dark:text-grey-50 mx-3 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white hover:cursor-pointer"
                  />
                </div>

                <Pagination.NextButton>
                  <ChevronRightIcon className="dark:stroke-grey-50 h-5 w-5" />
                </Pagination.NextButton>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseSearchList;
