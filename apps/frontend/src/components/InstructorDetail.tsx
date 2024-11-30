import React from "react";
import { useAppSelector } from "~/app/hooks";
import { useFetchFCEInfosByInstructor } from "~/app/api/fce";
import Loading from "./Loading";
import { InstructorFCEDetail } from "./InstructorFCEDetail";
import { toNameCase } from "~/app/utils";
import { Card } from "./Card";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

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
  const { isPending, data: fces } = useFetchFCEInfosByInstructor(name, isSignedIn, getToken);

  if (isPending || !fces) {
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
    </Card>
  );
};

export default InstructorDetail;
