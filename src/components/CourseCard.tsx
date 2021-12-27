import { BookmarkIcon } from "@heroicons/react/outline";
import { Course } from "../app/types";
import {
  compareSessions,
  sessionToShortString,
  displayUnits,
  courseListToString,
  filterSessions,
  injectLinks,
} from "../app/utils";

interface Props {
  info: Course;
}

const CourseCard = ({ info }: Props) => {
  const sortedSchedules = filterSessions([...info.schedules]).sort(
    compareSessions
  );
  const mostRecentSchedules = sortedSchedules.slice(0, 3);
  const schedulesAvailableString = mostRecentSchedules
    .map(sessionToShortString)
    .join(", ");

  return (
    <div className="p-6 rounded-md bg-white drop-shadow-sm">
      <div className="flex-1 flex flex-row">
        <div className="flex-1 flex flex-col">
          <div className="text-zinc-600">
            <div className="text-lg">
              <span className="font-semibold mr-2">{info.courseID}</span>
              <span className="">{info.name}</span>
            </div>
            <div className="text-sm text-zinc-500">{info.department}</div>
          </div>
          <div className="flex-1 mt-4 text-sm text-zinc-600 leading-relaxed">
            {injectLinks(info.desc)}
          </div>
        </div>
        <div className="w-64 text-zinc-600">
          <div className="ml-8 space-y-2">
            <div className="flex flex-row justify-between">
              <div>
                <div className="text-lg">{displayUnits(info.units)} units</div>
                <div className="text-md text-zinc-500">10.0 hrs/wk</div>
              </div>
              <div>
                <BookmarkIcon className="h-6 w-6" />
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
    </div>
  );
};

export default CourseCard;
