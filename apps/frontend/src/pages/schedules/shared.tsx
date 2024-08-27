import { NextPage } from "next";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Loading from "~/components/Loading";
import { getCourseIDs } from "~/app/utils";
import { useAppDispatch } from "~/app/hooks";
import { userSchedulesSlice } from "~/app/userSchedules";
import { showToast } from "~/components/Toast";
import { ShareIcon } from "@heroicons/react/24/outline";

const SharedSchedulePage: NextPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const coursesString = router.query.courses as string;

  useEffect(() => {
    if (router.isReady) {
      const courseIDs = getCourseIDs(coursesString);
      dispatch(userSchedulesSlice.actions.createSharedSchedule(courseIDs));
      showToast({ message: "Created a shared schedule.", icon: ShareIcon });
      void router.push("/schedules");
    }
  }, [dispatch, router, coursesString, router.isReady]);

  return <Loading />;
};

export default SharedSchedulePage;
