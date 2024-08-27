import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import CourseCard from "./CourseCard";
import { selectCourseResults } from "~/app/cache";
import Loading from "./Loading";
import { fetchCourseInfosByPage } from "~/app/api/course";
import { fetchFCEInfosByCourse } from "~/app/api/fce";
import { Pagination } from "./Pagination";
import { userSlice } from "~/app/user";

const CoursePage = () => {
  const dispatch = useAppDispatch();

  const pageCourses = useAppSelector((state) => state.cache.pageCourses);
  const page = useAppSelector((state) => state.cache.page);

  const exactResultsCourses = useAppSelector(
    (state) => state.cache.exactResultsCourses
  );

  const showFCEs = useAppSelector((state) => state.user.showFCEs);
  const showCourseInfos = useAppSelector((state) => state.user.showCourseInfos);
  const showSchedules = useAppSelector((state) => state.user.showSchedules);
  const loggedIn = useAppSelector((state) => state.user.loggedIn);

  const coursesToShow: string[] = useMemo(() => {
    if (page === 1 && exactResultsCourses.length > 0) {
      if (pageCourses.includes(exactResultsCourses[0])) {
        const filteredCourses = pageCourses.filter(
          (courseID) => !exactResultsCourses.includes(courseID)
        );
        return [...exactResultsCourses, ...filteredCourses];
      } else {
        return pageCourses;
      }
    } else {
      return pageCourses;
    }
  }, [exactResultsCourses, pageCourses, page]);

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
            showSchedules={showSchedules}
          />
        ))}
    </div>
  );
};

const CourseSearchList = () => {
  const pages = useAppSelector((state) => state.cache.totalPages);
  const curPage = useAppSelector((state) => state.cache.page);

  const loading = useAppSelector((state) => state.cache.coursesLoading);
  const dispatch = useAppDispatch();

  dispatch(userSlice.actions.resetFilters()); // Not ideal

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
          <div className="mx-auto my-6">
            <Pagination
              currentPage={curPage - 1}
              setCurrentPage={handlePageClick}
              totalPages={pages}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CourseSearchList;
