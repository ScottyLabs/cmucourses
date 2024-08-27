import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { compareSessions, filterSessions } from "~/app/utils";
import CourseCard from "./CourseCard";
import { Course, Schedule } from "~/app/types";
import { fetchFCEInfosByCourse } from "~/app/api/fce";
import { SchedulesCard } from "./SchedulesCard";
import { FCECard } from "./FCECard";

type Props = {
  info: Course;
  schedules: Schedule[];
};

const CourseDetail = ({ info, schedules }: Props) => {
  const dispatch = useAppDispatch();
  const loggedIn = useAppSelector((state) => state.user.loggedIn);

  useEffect(() => {
    void dispatch(fetchFCEInfosByCourse({ courseIDs: [info.courseID] }));
  }, [dispatch, info.courseID, loggedIn]);

  const fces = useAppSelector((state) => state.cache.fces[info.courseID]);

  return (
    <div className="m-auto space-y-4 p-6">
      <CourseCard info={info} showFCEs={false} showCourseInfo={true} />
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
