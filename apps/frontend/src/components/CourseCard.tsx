import {
  approximateHours,
  compareSessions,
  courseListToString,
  displayUnits,
  filterSessions,
  injectLinks,
  sessionToShortString,
} from "~/app/utils";
import { useAppSelector } from "~/app/hooks";
import BookmarkButton from "./BookmarkButton";
import Link from "next/link";
import { FCEDetail } from "./FCEDetail";
import { Card } from "./Card";
import { CourseSchedulesDetail } from "./CourseSchedulesDetail";
import { useFetchCourseInfo } from "~/app/api/course";
import { useFetchFCEInfoByCourse } from "~/app/api/fce";
import { useAuth } from "@clerk/nextjs";
import FallingText from "./aprilfools/FallingText";
import CircularText from "./aprilfools/CircularText";
import CountUp from "./aprilfools/CountUp";
import DecryptedText from "./aprilfools/DecryptedText";

interface Props {
  courseID: string;
  showFCEs: boolean;
  showCourseInfo?: boolean;
  showSchedules?: boolean;
}

const CourseCard = ({
  courseID,
  showFCEs,
  showCourseInfo,
  showSchedules,
}: Props) => {
  const { isSignedIn } = useAuth();
  const { isPending: isCourseInfoPending, data: info } =
    useFetchCourseInfo(courseID);
  const { isPending: isFCEInfoPending, data: { fces } = {} } =
    useFetchFCEInfoByCourse(courseID);
  const options = useAppSelector((state) => state.user.fceAggregation);

  if (isCourseInfoPending || isFCEInfoPending || !info) {
    return <></>;
  }

  const sortedSchedules = filterSessions(info.schedules || []).sort(
    compareSessions
  );
  const mostRecentSchedules = sortedSchedules.slice(0, 2);
  const schedulesAvailableString = mostRecentSchedules
    .map(sessionToShortString)
    .join(", ");

  const hours: number | undefined = fces
    ? approximateHours(fces, options)
    : undefined;

  return (
    <Card>
      <div className="grid auto-rows-min grid-cols-8 gap-x-6 gap-y-2">
        <div className="col-span-5 col-start-1 row-span-1 row-start-1 md:col-span-6">
          <Link href={`/course/${info.courseID}`}>
            <div className="cursor-pointer text-lg text-gray-800">
              <span className="mr-2 inline-block whitespace-nowrap font-semibold">
                <DecryptedText text={info.courseID} />
              </span>
              <DecryptedText text={info.name} />
              {/* <span className="leading-3">{info.name}</span> */}
            </div>
          </Link>
          <div className="text-sm text-gray-500">{info.department}</div>
        </div>

        <div className="col-span-3 md:col-span-2">
          <div className="flex flex-row justify-between">
            <div />
            {/* <div className="text-lg text-gray-700">
              {displayUnits(info.units)} units
            </div> */}
            <div>
              <BookmarkButton courseID={info.courseID} />
            </div>
          </div>
          {/* {isSignedIn && hours && (
            <div className="text-md text-gray-500">{hours} hrs/week</div>
          )} */}
        </div>

        <div className="col-span-full text-gray-700 md:col-span-2 md:col-start-7">
          <div className="mb-4">
            <CircularText
              text={`${displayUnits(info.units)} UNITS${isSignedIn && hours && ` * ${hours} HRS/WEEK * `}`}
              onHover="goBonkers"
              spinDuration={20}
              className="custom-class"
            />
          </div>
          <div className="text-md mb-1 hidden md:block">
            {schedulesAvailableString}
          </div>
          {showCourseInfo && (
            <div className="flex flex-row justify-between space-x-4 md:flex-col md:space-x-0 md:space-y-2">
              <div>
                <div className="font-semibold">
                  Prereq<span className="hidden lg:inline">uisite</span>s
                </div>
                <div className="text-md text-gray-500">
                  {injectLinks(info.prereqString || "None")}
                </div>
              </div>
              <div>
                <div className="font-semibold">
                  Coreq<span className="hidden lg:inline">uisite</span>s
                </div>
                <div className="text-md text-gray-500">
                  {injectLinks(courseListToString(info.coreqs))}
                </div>
              </div>
              <div>
                <div className="font-semibold">Crosslisted</div>
                <div className="text-md text-gray-500">
                  {injectLinks(courseListToString(info.crosslisted))}
                </div>
              </div>
            </div>
          )}
        </div>
        {showCourseInfo && (
          <div className="col-span-full row-span-1 row-start-3 text-sm leading-relaxed text-gray-600 md:col-span-6 md:row-start-2">
            <FallingText
              text={info.desc}
              trigger="hover"
              backgroundColor="transparent"
              wireframes={false}
              gravity={0.56}
              fontSize="2rem"
              mouseConstraintStiffness={0.9}
            />

            {/* {injectLinks(info.desc)} */}
          </div>
        )}
      </div>
      <div className="m-auto space-y-4">
        {showFCEs && fces && <FCEDetail fces={fces} />}
        {showSchedules && sortedSchedules && (
          <CourseSchedulesDetail scheduleInfos={sortedSchedules} />
        )}
      </div>
    </Card>
  );
};

export default CourseCard;
