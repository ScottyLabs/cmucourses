import { NextPage } from "next";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Loading from "../../components/Loading";
import { getCourseIds } from "../../app/utils";
import { useAppDispatch } from "../../app/hooks";
import { userSlice } from "../../app/user";

const SharedSchedulePage: NextPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const coursesString = router.query.courses as string;

  useEffect(() => {
    if (router.isReady) {
      const courseIDs = getCourseIds(coursesString);
      dispatch(
        userSlice.actions.createSharedSchedule({
          courses: courseIDs,
        })
      );
      router.push("/schedules");
    }
  }, [dispatch, router, coursesString, router.isReady]);

  return <Loading />;
};

export default SharedSchedulePage;
