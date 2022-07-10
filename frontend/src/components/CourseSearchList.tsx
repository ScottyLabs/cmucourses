import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import CourseCard from "./CourseCard";
import { Pagination } from "react-headless-pagination";
import { selectCourseResults } from "../app/cache";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline";
import Loading from "./Loading";
import { fetchCourseInfosByPage } from "../app/api/course";
import { fetchFCEInfosByCourse } from "../app/api/fce";

const CoursePage = () => {
  const dispatch = useAppDispatch();

  const pageCourses = useAppSelector((state) => state.cache.pageCourses);
  const page = useAppSelector((state) => state.cache.page);

  const exactResultsCourses = useAppSelector(
    (state) => state.cache.exactResultsCourses
  );
  const exactMatchesOnly = useAppSelector(
    (state) => state.user.filter.exactMatchesOnly
  );

  const showFCEs = useAppSelector((state) => state.user.showFCEs);
  const showCourseInfos = useAppSelector((state) => state.user.showCourseInfos);
  const loggedIn = useAppSelector((state) => state.user.loggedIn);

  let coursesToShow: string[] = useMemo(() => {
    if (exactMatchesOnly) {
      return (coursesToShow = [...exactResultsCourses]);
    } else if (page === 1 && exactResultsCourses.length > 0) {
      return (coursesToShow = [
        ...exactResultsCourses,
        ...pageCourses.filter(
          (courseID) => !exactResultsCourses.includes(courseID)
        ),
      ]);
    } else {
      return [...pageCourses];
    }
  }, [exactMatchesOnly, exactResultsCourses, pageCourses, page]);

  const results = useAppSelector(selectCourseResults(coursesToShow));

  useEffect(() => {
    if (loggedIn && coursesToShow) {
      void dispatch(fetchFCEInfosByCourse({ courseIDs: coursesToShow }));
    }
  }, [dispatch, coursesToShow, loggedIn]);

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
  const pages = useAppSelector((state) => state.cache.totalPages);
  const curPage = useAppSelector((state) => state.cache.page);

  const loading = useAppSelector((state) => state.cache.coursesLoading);
  const exactMatchesOnly = useAppSelector(
    (state) => state.user.filter.exactMatchesOnly
  );

  const dispatch = useAppDispatch();

  const handlePageClick = (page: number) => {
    void dispatch(fetchCourseInfosByPage(page + 1));
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
                className="text-gray-600 flex w-full justify-center"
              >
                <Pagination.PrevButton className="">
                  <ChevronLeftIcon className="h-5 w-5 dark:stroke-gray-50" />
                </Pagination.PrevButton>

                <div className="flex items-center align-baseline">
                  <Pagination.PageButton
                    activeClassName="bg-gray-100"
                    inactiveClassName=""
                    className="mx-3 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white hover:cursor-pointer"
                  />
                </div>

                <Pagination.NextButton>
                  <ChevronRightIcon className="h-5 w-5 dark:stroke-gray-50" />
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
