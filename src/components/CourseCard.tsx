import { Course } from "../app/types";
import {
  compareSessions,
  sessionToShortString,
  displayUnits,
  courseListToString,
  filterSessions,
  injectLinks,
  approximateHours,
} from "../app/utils";
import { aggregateFCEs } from "../app/fce";
import { useSelector, RootStateOrAny } from "react-redux";
import BookmarkButton from "./BookmarkButton";
import Link from "next/link";
import { FCEDetail } from "./FCEDetail";

interface Props {
  info: Course;
  showFCEs: boolean;
}

const CourseCard = ({ info, showFCEs }: Props) => {
  const sortedSchedules = filterSessions([...info.schedules]).sort(
    compareSessions
  );
  const mostRecentSchedules = sortedSchedules.slice(0, 3);
  const schedulesAvailableString = mostRecentSchedules
    .map(sessionToShortString)
    .join(", ");

  const loggedIn = useSelector(
    (state: RootStateOrAny) => state.user.loggedIn
  );

  const hours: number | undefined = info.fces
    ? approximateHours(info.fces, 2)
    : undefined;

  let fces = useSelector(
    (state: RootStateOrAny) => state.courses.fces[info.courseID]
  );

  if (showFCEs) {
    let aggregateData;
    if (fces) aggregateData = aggregateFCEs(fces);
  }

  return (
    <div className="p-6 bg-white rounded-md drop-shadow-sm">
      <div className="flex flex-row flex-1">
        <div className="flex flex-col flex-1">
          <div className="text-zinc-600">
            <Link href={`/course/${info.courseID}`}>
              <div className="text-lg hover:cursor-pointer">
                <span className="mr-2 font-semibold">{info.courseID}</span>
                <span className="">{info.name}</span>
              </div>
            </Link>
            <div className="text-sm text-zinc-500">{info.department}</div>
          </div>
          <div className="flex-1 mt-4 text-sm leading-relaxed text-zinc-600">
            {injectLinks(info.desc)}
          </div>
        </div>
        <div className="w-64 text-zinc-600">
          <div className="ml-8 space-y-2">
            <div className="flex flex-row justify-between">
              <div>
                <div className="text-lg">{displayUnits(info.units)} units</div>
                {loggedIn && hours && (
                  <div className="text-md text-zinc-500">{hours} hrs/week</div>
                )}
              </div>
              <div>
                <BookmarkButton courseID={info.courseID} />
              </div>
            </div>

            <div>{schedulesAvailableString}</div>
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
        </div>
      </div>
      {showFCEs && fces && <FCEDetail fces={fces} />}
    </div>
  );
};

export default CourseCard;
