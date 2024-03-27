import React from "react";
import { Schedule } from "../app/types";
import { Card } from "./Card";
import { SchedulesDetail } from "./SchedulesDetail";

export const SchedulesCard = ({
  scheduleInfos,
}: {
  scheduleInfos: Schedule[];
}) => {
  return (
    <Card>
      <Card.Header>Schedules</Card.Header>
      <SchedulesDetail scheduleInfos={scheduleInfos}/>
    </Card>
  );
};
