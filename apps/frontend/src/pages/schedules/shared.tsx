import { NextPage } from "next";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Loading from "~/components/Loading";
import { getCourseIDs } from "~/app/utils";
import { useAppDispatch } from "~/app/hooks";
import { userSchedulesSlice } from "~/app/userSchedules";
import { showToast } from "~/components/Toast";
import { ShareIcon } from "@heroicons/react/24/outline";
import { decodeSharedSchedule } from "~/app/scheduleSharing";
import { getCalendarColor } from "~/app/utils";

const SharedSchedulePage: NextPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const coursesString = router.query.courses as string;
  const encoded = router.query.data as string;

  useEffect(() => {
    if (router.isReady) {
      const decoded = encoded ? decodeSharedSchedule(encoded) : null;
      const courseIDs = decoded ? decoded.courses : getCourseIDs(coursesString);
      dispatch(
        userSchedulesSlice.actions.createSharedSchedule(
          decoded ?? {
            version: 1,
            name: "Shared Schedule",
            courses: courseIDs,
            selected: courseIDs,
            session: { year: "", semester: "" },
            courseSessions: Object.fromEntries(
              courseIDs.map((courseID, index) => [
                courseID,
                { Lecture: "", Section: "", Color: getCalendarColor(index) },
              ])
            ),
          }
        )
      );
      showToast({ message: "Created a shared schedule.", icon: ShareIcon });
      void router.push("/schedules");
    }
  }, [dispatch, router, coursesString, encoded, router.isReady]);

  return <Loading />;
};

export default SharedSchedulePage;
