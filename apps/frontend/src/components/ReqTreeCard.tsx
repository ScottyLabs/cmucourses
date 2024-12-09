import {
  courseListToString,
  injectLinks,
} from "~/app/utils";
import { Card } from "./Card";
import { useFetchCourseInfo } from "~/app/api/course";

interface Props {
  courseID: string;
}

export const ReqTreeCard = ({
  courseID
}: Props) => { //add any inputs here (courses, prereqs, etc.)
  const { isPending: isCourseInfoPending, data: info } = useFetchCourseInfo(courseID);

  if (isCourseInfoPending || !info) {
    return (<></>);
  }

  return (
    <Card>
      <Card.Header>Prerequisite, Corequisite, and Postrequisite Tree</Card.Header>
      <div className="space-y-4">
        <div className="flex flex-col">
          <div className="font-semibold">
            Postrequisites
          </div>
          <div className="text-md text-gray-500">
            {injectLinks(courseListToString(info.postreqs))}
          </div>
        </div>
      </div>
    </Card>
  );
};
// Add the tree logic or call the tree component within the <Card> tag (look at FCECard.tsx as an example)