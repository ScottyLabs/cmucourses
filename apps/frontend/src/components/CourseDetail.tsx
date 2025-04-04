import React from "react";
import { compareSessions, filterSessions } from "~/app/utils";
import CourseCard from "./CourseCard";
import { useFetchFCEInfoByCourse } from "~/app/api/fce";
import { SchedulesCard } from "./SchedulesCard";
import { FCECard } from "./FCECard";
import { useFetchCourseInfo, useFetchCourseRequisites } from "~/app/api/course";
import ReqTreeCard from "./ReqTreeCard";

type Props = {
  courseID: string;
};

const CourseDetail = ({ courseID }: Props) => {
  const { data: { fces } = {} } = useFetchFCEInfoByCourse(courseID);
  const { data: info } = useFetchCourseInfo(courseID);
  const { data: requisites } = useFetchCourseRequisites(courseID);

  if (!info || !requisites) {
    return <div>Loading...</div>;
  }

  return (
    <div className="m-auto space-y-4 p-6">
      <CourseCard courseID={courseID} showFCEs={false} showCourseInfo={true} />
      {fces && <FCECard fces={fces} />}
      {info.schedules && (
        <SchedulesCard
          scheduleInfos={filterSessions([...info.schedules]).sort(
            compareSessions
          )}
        />
      )}
      {info.prereqs && requisites.prereqRelations && requisites.postreqs && (
        <ReqTreeCard
          courseID={courseID}
          prereqs={requisites.prereqs}
          prereqRelations={requisites.prereqRelations}
          postreqs={requisites.postreqs}
        />
      )}
    </div>
  );
};

export default CourseDetail;
