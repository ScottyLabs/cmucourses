import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import CourseCard from "./CourseCard";
import { Pagination } from "react-headless-pagination";
import { fetchCourseInfosByPage, fetchFCEInfos } from "../app/courses";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline";
import Loading from "./Loading";
import { isExactSearch } from "../app/utils";

const CoursePage = () => {
  const dispatch = useAppDispatch();
  const results = useAppSelector((state) => state.courses.results);

  const page = useAppSelector((state) => state.courses.page);

  const exactResults = useAppSelector((state) => state.courses.exactResults);
  const exactResultsActive = useAppSelector(
    (state) => state.courses.exactResultsActive
  );
  const exactMatchesOnly = useAppSelector(
    (state) => state.user.filter.exactMatchesOnly
  );

  const showFCEs = useAppSelector((state) => state.user.showFCEs);
  const showCourseInfos = useAppSelector((state) => state.user.showCourseInfos);
  const loggedIn = useAppSelector((state) => state.user.loggedIn);

  let resultsToShow;
  if (exactMatchesOnly) {
    resultsToShow = [...exactResults];
  } else if (page === 1 && exactResultsActive) {
    const exactCourseIds = exactResults.map(({ courseID }) => courseID);
    resultsToShow = [
      ...exactResults,
      ...results.filter(({ courseID }) => !exactCourseIds.includes(courseID)),
    ];
  } else {
    resultsToShow = results;
  }

  useEffect(() => {
    if (loggedIn && resultsToShow) {
      dispatch(
        fetchFCEInfos({
          courseIDs: resultsToShow.map((course) => course.courseID),
        })
      );
    }
  }, [resultsToShow, loggedIn]);

  return (
    <div className="space-y-4">
      {resultsToShow &&
        resultsToShow.map((course) => (
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

const CourseList = () => {
  const pages = useAppSelector((state) => state.courses.totalPages);
  const curPage = useAppSelector((state) => state.courses.page);

  const loading = useAppSelector((state) => state.courses.coursesLoading);
  const exactMatchesOnly = useAppSelector(
    (state) => state.user.filter.exactMatchesOnly
  );
  const exactResultsActive = useAppSelector(
    (state) => state.courses.exactResultsActive
  );
  const exactResultsLoading = useAppSelector(
    (state) => state.courses.exactResultsLoading
  );

  const dispatch = useAppDispatch();

  const handlePageClick = (page) => {
    dispatch(fetchCourseInfosByPage(page + 1));
  };

  return (
    <div className="p-6">
      {loading || (exactResultsActive && exactResultsLoading) ? (
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
                className="flex w-full justify-center text-grey-600"
              >
                <Pagination.PrevButton className="">
                  <ChevronLeftIcon className="h-5 w-5 dark:stroke-grey-50" />
                </Pagination.PrevButton>

                <div className="flex items-center align-baseline">
                  <Pagination.PageButton
                    activeClassName="bg-grey-100 dark:bg-grey-700"
                    inactiveClassName=""
                    className="mx-3 inline-flex h-8 w-8 items-center justify-center rounded-full hover:cursor-pointer hover:bg-white dark:text-grey-50"
                  />
                </div>

                <Pagination.NextButton>
                  <ChevronRightIcon className="h-5 w-5 dark:stroke-grey-50" />
                </Pagination.NextButton>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseList;
