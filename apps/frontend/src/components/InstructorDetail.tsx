import React from "react";
import { useAppSelector } from "~/app/hooks";
import { useFetchFCEInfosByInstructor } from "~/app/api/fce";
import Loading from "./Loading";
import { InstructorFCEDetail } from "./InstructorFCEDetail";
import { sessionToString, toNameCase } from "~/app/utils";
import { Card } from "./Card";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useFetchSchedulesByInstructor } from "~/app/api/schedules";
import { InstructorSchedulesDetail } from "~/components/InstructorSchedulesDetail";

type Props = {
  name: string;
  showLoading: boolean;
  extraFilters?: boolean;
};

const InstructorDetail = ({ name, showLoading, extraFilters }: Props) => {
  const aggregationOptions = useAppSelector(
    (state) => state.user.fceAggregation
  );

  const { isSignedIn, getToken } = useAuth();
  const { isPending: isFCEsPending, data: fces } = useFetchFCEInfosByInstructor(name, isSignedIn, getToken);
  const { isPending: isSchedulesPending, data: schedules } = useFetchSchedulesByInstructor(name);

  if (isFCEsPending || isSchedulesPending || !fces || !schedules) {
    return (
      <div
        className={
          showLoading ? "m-auto space-y-4 p-6" : "m-auto hidden space-y-4 p-6"
        }
      >
        <Loading />
      </div>
    );
  }

  const scheduleInfos: { [session: string]: string[] } = {};
  schedules.schedules.forEach((schedule) => {
    const session = sessionToString(schedule);
    if (!scheduleInfos[session]) {
      scheduleInfos[session] = [schedule.courseID];
    } else {
      scheduleInfos[session].push(schedule.courseID);
    }
  });

  return (
    <Card>
      <div>
        <Link href={`/instructor/${name}`}>
          <div className="text-md font-semibold text-gray-800">
            {toNameCase(name)}
          </div>
        </Link>
        {/* TODO: Add more information about instructor using Directory API */}
      </div>
      <div>
        <InstructorFCEDetail
          fces={fces}
          aggregationOptions={aggregationOptions}
          extraFilters={extraFilters}
        />
      </div>
      {schedules.schedules.length > 0 && (<div className="pt-1">
        <InstructorSchedulesDetail scheduleInfos={scheduleInfos} />
      </div>)}
    </Card>
  );
};

export default InstructorDetail;
