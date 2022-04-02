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

interface Props {
  info: Course;
  showFCEs: boolean;
  showCourseInfo?: boolean;
}

const CourseCard = ({ info, showFCEs, showCourseInfo }: Props) => {
  const sortedSchedules = filterSessions([...info.schedules]).sort(
    compareSessions,
  );
  const mostRecentSchedules = sortedSchedules.slice(0, 2);
  const schedulesAvailableString = mostRecentSchedules
    .map(sessionToShortString)
    .join(", ");

  const loggedIn = useAppSelector((state) => state.user.loggedIn);
  const fces = useAppSelector((state) => state.courses.fces[info.courseID]);

  const hours: number | undefined = fces
    ? approximateHours(fces, 2)
    : undefined;

  return (
    <div className="p-6 bg-white rounded-lg drop-shadow-md">
      <div className="grid grid-cols-8 gap-x-6 gap-y-2 auto-rows-min">
        <div className="col-span-5 col-start-1 row-span-1 row-start-1 md:col-span-6 text-zinc-600">
          <Link href={`/course/${info.courseID}`}>
            <div className="text-lg hover:cursor-pointer">
              <span className="mr-2 font-semibold">{info.courseID}</span>
              <span className="">{info.name}</span>
            </div>
          </Link>
          <div className="text-sm text-zinc-500">{info.department}</div>
        </div>

        <div className="col-span-3 md:col-span-2">
          <div className="flex flex-row justify-between">
            <div>
              <div className="text-lg">{displayUnits(info.units)} units</div>
            </div>
            <div>
              <BookmarkButton courseID={info.courseID} />
            </div>
          </div>
          {loggedIn && hours && (
            <div className="text-md text-zinc-500">{hours} hrs/week</div>
          )}
        </div>

        <div className="col-span-full md:col-span-2 md:col-start-7">
          <div className="hidden mb-1 md:block text-md">{schedulesAvailableString}</div>
          {showCourseInfo && (
            <div className="flex flex-row justify-between space-x-4 md:space-x-0 md:space-y-2 md:flex-col">
              <div>
                <div className="font-semibold">Prerequisites</div>
                <div className="text-md text-zinc-500">
                  {injectLinks(info.prereqString || "None")}
                </div>
              </div>
              <div>
                <div className="font-semibold">Corequisites</div>
                <div className="text-md text-zinc-500">
                  {injectLinks(courseListToString(info.coreqs))}
                </div>
              </div>
              <div>
                <div className="font-semibold">Crosslisted</div>
                <div className="text-md text-zinc-500">
                  {injectLinks(courseListToString(info.crosslisted))}
                </div>
              </div>
            </div>
          )}
        </div>
        {showCourseInfo && (
          <div
            className="row-span-1 row-start-3 text-sm leading-relaxed md:row-start-2 col-span-full md:col-span-6 text-zinc-600">
            {injectLinks(info.desc)}
          </div>
        )}
      </div>
      {showFCEs && fces && <FCEDetail fces={fces} />}
    </div>
  );
};

export default CourseCard;
