import React from "react";
import CourseCard from "./CourseCard";
import { useFetchCourseInfos } from "~/app/api/course";
import Loading from "./Loading";

interface Props {
  courseIDs: string[];
  children: React.ReactNode;
}

const CourseList = ({ courseIDs, children }: Props) => {
  const results = useFetchCourseInfos(courseIDs);

  return (
    <div className="pt-2 pb-6 px-2 md:px-6">
      {results.length > 0 ? (
        <>
          <div className="mt-3 pb-2 text-sm text-gray-400">
            {courseIDs.length} Saved Courses{" "}
          </div>
          <div className="space-y-4">
            {/* We found less courses than what we search for, so put a Loading indicator */}
            {courseIDs.length > results.length && <Loading />}
            {courseIDs.map((courseID) => (
              <CourseCard
                courseID={courseID}
                key={courseID}
                showFCEs={true}
                showCourseInfo={true}
                showSchedules={true}
              />
            ))}
          </div>
        </>
      ) : (
        children
      )}
    </div>
  );
};

export default CourseList;
