import React from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import CourseCard from "./CourseCard";
import {
  fetchCourseInfos,
  fetchFCEInfos,
  selectCourseResults,
} from "../app/courses";
import Loading from "./Loading";
import useDeepCompareEffect from "use-deep-compare-effect";

interface Props {
  courseIDs: string[];
  children: React.ReactNode;
}

const CourseList = ({ courseIDs, children }: Props) => {
  const loggedIn = useAppSelector((state) => state.user.loggedIn);
  const loading = useAppSelector((state) => state.courses.coursesLoading);
  const dispatch = useAppDispatch();

  useDeepCompareEffect(() => {
    console.log(courseIDs);
    if (courseIDs) {
      dispatch(fetchCourseInfos(courseIDs));
      if (loggedIn) dispatch(fetchFCEInfos({ courseIDs }));
    }
  }, [courseIDs]);

  const results = useAppSelector(selectCourseResults(courseIDs));

  return (
    <div className="py-6 px-2 md:px-6">
      {loading ? (
        <Loading />
      ) : results && results.length > 0 ? (
        <div className="space-y-4">
          {results.map((course) => (
            <CourseCard
              info={course}
              key={course.courseID}
              showFCEs={true}
              showCourseInfo={true}
            />
          ))}
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default CourseList;
