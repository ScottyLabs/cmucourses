import React from "react";
import { Card } from "./Card";
import { useFetchCourseInfo } from "~/app/api/course";
import { courseListToString, injectLinks } from "~/app/utils";

interface Props {
  courseID: string;
}

export const ReqTreeCard = ({ courseID }: Props) => {
  const { isPending: isCourseInfoPending, data: info } = useFetchCourseInfo(courseID);

  if (isCourseInfoPending || !info) {
    return <></>;
  }

  return (
    <Card>
      <Card.Header>Prerequisite, Corequisite, and Postrequisite Tree</Card.Header>
      <div className="space-y-4">

        {/* Prerequisite List */}
        {info.prereqs && info.prereqs.length > 0 && (
          <div className="flex flex-col">
            <div className="font-semibold">Prerequisites</div>
            <div className="text-md text-gray-500">
              {injectLinks(courseListToString(info.prereqs))}
            </div>
          </div>
        )}

        {/* Postrequisite List */}
        {info.postreqs && info.postreqs.length > 0 && (
          <div className="flex flex-col">
            <div className="font-semibold">Postrequisites</div>
            <div className="text-md text-gray-500">
              {injectLinks(courseListToString(info.postreqs))}
            </div>
          </div>
        )}

      </div>
    </Card>
  );
};

export default ReqTreeCard;
