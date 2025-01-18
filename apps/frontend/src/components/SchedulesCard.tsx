import React from "react";
import { Schedule } from "~/app/types";
import { Card } from "./Card";
import { CourseSchedulesDetail } from "./CourseSchedulesDetail";

export const SchedulesCard = ({
  scheduleInfos,
}: {
  scheduleInfos: Schedule[];
}) => {
  return (
    <Card>
      <Card.Header>Schedules</Card.Header>
      <CourseSchedulesDetail scheduleInfos={scheduleInfos} />
    </Card>
  );
};
