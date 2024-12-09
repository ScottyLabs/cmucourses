import React from "react";
import { compareSessions, filterSessions } from "~/app/utils";
import CourseCard from "./CourseCard";
import { useFetchFCEInfoByCourse } from "~/app/api/fce";
import { SchedulesCard } from "./SchedulesCard";
import { FCECard } from "./FCECard";
import { useFetchCourseInfo } from "~/app/api/course";
import ReqTreeCard from "./ReqTreeCard";

type Props = {
  courseID: string;
};

const CourseDetail = ({ courseID }: Props) => {
  const { data: { fces } = {} } = useFetchFCEInfoByCourse(courseID);
  const { data: info } = useFetchCourseInfo(courseID);

  if (!info) {
    return <div>Loading...</div>;
  }

  return (
    <div className="m-auto space-y-4 p-6">
      <CourseCard courseID={courseID} showFCEs={false} showCourseInfo={true} />
      
      {fces && <FCECard fces={fces} />}

      {info.schedules && (
        <SchedulesCard
          scheduleInfos={filterSessions([...info.schedules]).sort(compareSessions)}
        />
      )}

      {info.prereqs && info.postreqs && (
        <ReqTreeCard
          courseID={courseID}
          prereqs={info.prereqs}
          postreqs={info.postreqs}
        />
      )}
    </div>
  );
};

export default CourseDetail;
