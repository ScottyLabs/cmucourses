import React from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import CourseCard from "./CourseCard";
import { selectCourseResults } from "../app/cache";
import useDeepCompareEffect from "use-deep-compare-effect";
import { fetchCourseInfos } from "../app/api/course";
import { fetchFCEInfosByCourse } from "../app/api/fce";
import Loading from "./Loading";

interface Props {
  courseIDs: string[];
  children: React.ReactNode;
}

const CourseList = ({ courseIDs, children }: Props) => {
  const loggedIn = useAppSelector((state) => state.user.loggedIn);
  const dispatch = useAppDispatch();

  useDeepCompareEffect(() => {
    if (courseIDs) {
      void dispatch(fetchCourseInfos(courseIDs));
      if (loggedIn) void dispatch(fetchFCEInfosByCourse({ courseIDs }));
    }
  }, [courseIDs]);

  const results = useAppSelector(selectCourseResults(courseIDs));

  return (
    <div className="py-6 px-2 md:px-6">
      {results.length > 0 ? (
        <div className="space-y-4">
          {/* We found less courses than what we search for, so put a Loading indicator */}
          {courseIDs.length > results.length && <Loading />}
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
