import React from "react";
import { compareSessions, filterSessions } from "~/app/utils";
import CourseCard from "./CourseCard";
import { useFetchFCEInfoByCourse } from "~/app/api/fce";
import { SchedulesCard } from "./SchedulesCard";
import { FCECard } from "./FCECard";
import { useFetchCourseInfo, useFetchCourseRequisites } from "~/app/api/course";
import ReqTreeCard from "./ReqTreeCard";
import SyllabusCard from "./SyllabusCard";
import SimpleSyllabiDisplay from "./SimpleSyllabiDisplay"; // Import the debug component

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

  // Get course number from courseID (e.g., "15-112" -> "112")
  const number = courseID.split("-")[1] || "";

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
      
      <SyllabusCard 
        department={info.department || ""} 
        number={number} 
      />
      
    </div>
  );
};

export default CourseDetail;