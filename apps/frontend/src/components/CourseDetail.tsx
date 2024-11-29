import React from "react";
import { compareSessions, filterSessions } from "~/app/utils";
import CourseCard from "./CourseCard";
import { Course, Schedule } from "~/app/types";
import { useFetchFCEInfoByCourse } from "~/app/api/fce";
import { SchedulesCard } from "./SchedulesCard";
import { FCECard } from "./FCECard";

type Props = {
  info: Course;
  schedules: Schedule[];
};

const CourseDetail = ({ info, schedules }: Props) => {
  const { data: { fces } = {} } = useFetchFCEInfoByCourse(info.courseID);

  return (
    <div className="m-auto space-y-4 p-6">
      <CourseCard courseID={info.courseID} showFCEs={false} showCourseInfo={true} />
      {fces && <FCECard fces={fces} />}
      {schedules && (
        <SchedulesCard
          scheduleInfos={filterSessions([...schedules]).sort(compareSessions)}
        />
      )}
    </div>
  );
};

export default CourseDetail;
