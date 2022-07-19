import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchFCEInfosByInstructor } from "../app/api/fce";
import { selectFCEResultsForInstructor } from "../app/cache";
import Loading from "./Loading";
import { InstructorFCEDetail } from "./InstructorFCEDetail";
import { toNameCase } from "../app/utils";

type Props = {
  name: string;
};

const InstructorDetail = ({ name }: Props) => {
  const dispatch = useAppDispatch();
  const loggedIn = useAppSelector((state) => state.user.loggedIn);

  const fces = useAppSelector(selectFCEResultsForInstructor(name));
  console.log(fces);

  useEffect(() => {
    if (name) void dispatch(fetchFCEInfosByInstructor(name));
  }, [dispatch, loggedIn, name]);

  if (!fces) {
    return (
      <div className="m-auto space-y-4 p-6">
        <Loading />
      </div>
    );
  }

  // const coursesTaught = new Set(fces.map(({ courseID }) => courseID));

  return (
    <div className="m-auto space-y-4 p-6">
      <div className="bg-white rounded-xl p-6 drop-shadow">
        <div>
          <div className="text-md text-gray-800 font-semibold">
            {toNameCase(name)}
          </div>
          {/* TODO: Add more information about instructor using Directory API */}
        </div>
        <div>
          <InstructorFCEDetail fces={fces} />
        </div>
      </div>
    </div>
  );
};

export default InstructorDetail;
