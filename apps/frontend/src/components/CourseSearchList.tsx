import React, { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import CourseCard from "./CourseCard";
import Loading from "./Loading";
import { useFetchCourseInfos, useFetchCourseInfosByPage } from "~/app/api/course";
import { Pagination } from "./Pagination";
import { userSlice } from "~/app/user";
import { filtersSlice } from "~/app/filters";

const CoursePage = () => {
  const page = useAppSelector((state) => state.filters.page);

  const { data: { docs } = {} } = useFetchCourseInfosByPage();

  const exactResultsCourses = useAppSelector(
    (state) => state.filters.exactResultsCourses
  );

  const showFCEs = useAppSelector((state) => state.user.showFCEs);
  const showCourseInfos = useAppSelector((state) => state.user.showCourseInfos);
  const showSchedules = useAppSelector((state) => state.user.showSchedules);

  const coursesToShow: string[] = useMemo(() => {
    const pageCourses = docs?.map((doc) => doc.courseID) || [];

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
  }, [exactResultsCourses, docs, page]);

  const results =  useFetchCourseInfos(coursesToShow);

  return (
    <div className="space-y-4">
      {results &&
        coursesToShow.map((courseID) => (
          <CourseCard
            courseID={courseID}
            key={courseID}
            showFCEs={showFCEs}
            showCourseInfo={showCourseInfos}
            showSchedules={showSchedules}
          />
        ))}
    </div>
  );
};

const CourseSearchList = () => {
  const curPage = useAppSelector((state) => state.filters.page);
  const { isPending, data: { totalPages } = {}  } = useFetchCourseInfosByPage();

  const dispatch = useAppDispatch();

  dispatch(userSlice.actions.resetFilters()); // Not ideal

  const handlePageClick = (page: number) => {
    void dispatch(filtersSlice.actions.setPage(page + 1));
  };

  return (
    <div className="p-6">
      {isPending || !totalPages ? (
        <Loading />
      ) : (
        <>
          <CoursePage />
          <div className="mx-auto my-6">
            <Pagination
              currentPage={curPage - 1}
              setCurrentPage={handlePageClick}
              totalPages={totalPages}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CourseSearchList;
