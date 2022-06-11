import { Course } from "../app/types";
import {
  approximateHours,
  compareSessions,
  courseListToString,
  displayUnits,
  filterSessions,
  injectLinks,
  sessionToShortString,
} from "../app/utils";
import { useAppSelector } from "../app/hooks";
import BookmarkButton from "./BookmarkButton";
import Link from "next/link";
import { FCEDetail } from "./FCEDetail";
import { selectFCEResultsForCourse } from "../app/courses";

interface Props {
  info: Course;
  showFCEs: boolean;
  showCourseInfo?: boolean;
}

const CourseCard = ({ info, showFCEs, showCourseInfo }: Props) => {
  const sortedSchedules = filterSessions([...info.schedules]).sort(
    compareSessions
  );
  const mostRecentSchedules = sortedSchedules.slice(0, 2);
  const schedulesAvailableString = mostRecentSchedules
    .map(sessionToShortString)
    .join(", ");

  const loggedIn = useAppSelector((state) => state.user.loggedIn);
  const fces = useAppSelector(selectFCEResultsForCourse(info.courseID));
  const options = useAppSelector((state) => state.user.fceAggregation);

  const hours: number | undefined = fces
    ? approximateHours(fces, options)
    : undefined;

  return (
    <div className="rounded-xl bg-white p-6 drop-shadow-md dark:bg-grey-900">
      <div className="grid auto-rows-min grid-cols-8 gap-x-6 gap-y-2">
        <div className="col-span-5 col-start-1 row-span-1 row-start-1 md:col-span-6">
          <Link href={`/course/${info.courseID}`}>
            <div className="text-lg text-grey-800 hover:cursor-pointer dark:text-grey-50">
              <span className="mr-2 font-semibold">{info.courseID}</span>
              <span className="">{info.name}</span>
            </div>
          </Link>
          <div className="text-sm text-grey-500 dark:text-grey-200">
            {info.department}
          </div>
        </div>

        <div className="col-span-3 md:col-span-2">
          <div className="flex flex-row justify-between">
            <div>
              <div className="text-lg text-grey-700 dark:text-grey-100">
                {displayUnits(info.units)} units
              </div>
            </div>
            <div>
              <BookmarkButton courseID={info.courseID} />
            </div>
          </div>
          {loggedIn && hours && (
            <div className="text-md text-grey-500 dark:text-grey-200">
              {hours} hrs/week
            </div>
          )}
        </div>

        <div className="col-span-full text-grey-700 dark:text-grey-200 md:col-span-2 md:col-start-7">
          <div className="text-md mb-1 hidden md:block">
            {schedulesAvailableString}
          </div>
          {showCourseInfo && (
            <div className="flex flex-row justify-between space-x-4 md:flex-col md:space-x-0 md:space-y-2">
              <div>
                <div className="font-semibold">Prerequisites</div>
                <div className="text-md text-grey-500 dark:text-grey-400">
                  {injectLinks(info.prereqString || "None")}
                </div>
              </div>
              <div>
                <div className="font-semibold">Corequisites</div>
                <div className="text-md text-grey-500 dark:text-grey-400">
                  {injectLinks(courseListToString(info.coreqs))}
                </div>
              </div>
              <div>
                <div className="font-semibold">Crosslisted</div>
                <div className="text-md text-grey-500 dark:text-grey-400">
                  {injectLinks(courseListToString(info.crosslisted))}
                </div>
              </div>
            </div>
          )}
        </div>
        {showCourseInfo && (
          <div className="col-span-full row-span-1 row-start-3 text-sm leading-relaxed text-grey-600 dark:text-grey-200 md:col-span-6 md:row-start-2">
            {injectLinks(info.desc)}
          </div>
        )}
      </div>
      {showFCEs && fces && <FCEDetail fces={fces} />}
    </div>
  );
};

export default CourseCard;
