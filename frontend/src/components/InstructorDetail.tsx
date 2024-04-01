import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchFCEInfosByInstructor } from "../app/api/fce";
import { selectFCEResultsForInstructor } from "../app/cache";
import Loading from "./Loading";
import { InstructorFCEDetail } from "./InstructorFCEDetail";
import { toNameCase } from "../app/utils";
import { Card } from "./Card";
import Link from "next/link";

type Props = {
  name: string;
  showLoading: boolean;
};

const InstructorDetail = ({ name, showLoading }: Props) => {
  const dispatch = useAppDispatch();
  const loggedIn = useAppSelector((state) => state.user.loggedIn);

  const fces = useAppSelector(selectFCEResultsForInstructor(name));

  const aggregationOptions = useAppSelector((state) => state.user.fceAggregation);

  useEffect(() => {
    if (name) void dispatch(fetchFCEInfosByInstructor(name));
  }, [dispatch, loggedIn, name]);

  if (!fces) {
    return (
      <div className={showLoading ? "m-auto space-y-4 p-6" : "m-auto space-y-4 p-6 hidden"}>
        <Loading />
      </div>
    );
  }

  // const coursesTaught = new Set(fces.map(({ courseID }) => courseID));

  return (
    <div className="m-auto space-y-4 p-6">
      <Card>
        <div>
          <Link href={`/instructor/${name}`}>
            <div className="text-md text-gray-800 font-semibold">
              {toNameCase(name)}
            </div>
          </Link>
          {/* TODO: Add more information about instructor using Directory API */}
        </div>
        <div>
          <InstructorFCEDetail fces={fces} aggregationOptions={aggregationOptions} />
        </div>
      </Card>
    </div>
  );
};

export default InstructorDetail;
