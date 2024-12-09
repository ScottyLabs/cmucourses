import React from "react";
import { compareSessions, filterSessions } from "~/app/utils";
import CourseCard from "./CourseCard";
import { useFetchFCEInfoByCourse } from "~/app/api/fce";
import { SchedulesCard } from "./SchedulesCard";
import { FCECard } from "./FCECard";
import { useFetchCourseInfo } from "~/app/api/course";
import { ReqTreeCard } from "./ReqTreeCard";

type Props = {
  courseID: string;
};

const CourseDetail = ({ courseID }: Props) => {
  const { data: { fces } = {} } = useFetchFCEInfoByCourse(courseID);
  const { data: { schedules } = {} } = useFetchCourseInfo(courseID);

  return (
    <div className="m-auto space-y-4 p-6">
      <CourseCard courseID={courseID} showFCEs={false} showCourseInfo={true} />
      {fces && <FCECard fces={fces} />}
      {schedules && (
        <SchedulesCard
          scheduleInfos={filterSessions([...schedules]).sort(compareSessions)}
        />
      )}
      {< ReqTreeCard courseID={courseID} />}
    </div>
  );
};

// Add the inputs/logic above inside {<ReqTreeCard> } (if no post/pre-requisites, display "No pre/poste-requisites" or similar)

export default CourseDetail;
