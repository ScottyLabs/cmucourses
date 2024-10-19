import React, { Dispatch, SetStateAction } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { Listbox } from "@headlessui/react";
import { classNames, sessionToString, stringToSession } from "~/app/utils";
import { CheckIcon } from "@heroicons/react/20/solid";
import {selectCourseResults} from "~/app/cache";
import { Lecture, Section } from "~/app/types";
import {
  CourseSessions,
  selectCourseSessionsInActiveSchedule,
  selectSessionInActiveSchedule,
  userSchedulesSlice
} from "~/app/userSchedules";

interface Props {
  courseIDs: string[];
}

const getTimes = (courseID: string, sessionType: string, sessions: Lecture[] | Section[], selectedSessions: CourseSessions, dispatch: Dispatch<SetStateAction<any>>) => {
  const selectedSession = selectedSessions[courseID]?.[sessionType] || "";

  return (
    <div className="pt-2">
      <Listbox value={selectedSession} onChange={(payload) => {
        dispatch(userSchedulesSlice.actions.updateActiveScheduleCourseSession({ courseID, sessionType, session: payload as string }));
      }}>
        <Listbox.Label className="flex">
          {sessionType}
        </Listbox.Label>
        <Listbox.Button
          className="relative mt-2 w-full cursor-default rounded border py-1 pl-1 pr-10 text-left transition duration-150 ease-in-out border-black sm:text-sm sm:leading-5">
            <span className="flex flex-wrap gap-1">
              {selectedSession.length === 0 ? (
                <span className="p-0.5">Select Lecture</span>
              ) : (
                <span
                  key={selectedSession}
                  className="flex items-center gap-1 rounded px-2 py-0.5"
                >
                  {selectedSession}
                </span>
              )}
            </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 stroke-gray-500 dark:stroke-zinc-400"/>
          </span>
        </Listbox.Button>
        <div className="absolute inset-x-3 mt-1 rounded shadow-lg bg-white">
          <Listbox.Options
            className="shadow-xs relative z-50 max-h-60 overflow-auto rounded py-1 text-base leading-6 bg-white focus:outline-none sm:text-sm sm:leading-5">
            {sessions.map((lecture) => (
              <Listbox.Option
                key={lecture.name}
                value={lecture.name}
                className={({active}) => {
                  return classNames(
                    "relative cursor-pointer select-none py-2 pl-3 pr-9 focus:outline-none ",
                    active ? "bg-indigo-600 text-gray-600" : "text-gray-900"
                  );
                }}
              >
                {({selected}) => (
                  <>
                      <span className={"block truncate"}>
                        <span
                          className={classNames(
                            "ml-1 text-gray-700",
                            selected ? "font-semibold" : "font-normal"
                          )}
                        >
                          {lecture.name}
                        </span>
                      </span>
                    {selected && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                          <CheckIcon className="h-5 w-5"/>
                        </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  )
}

const SectionSelector = ({ courseIDs }: Props) => {
  const dispatch = useAppDispatch();
  const CourseDetails = useAppSelector(selectCourseResults(courseIDs)).filter(x => x !== undefined);

  const selectedSession = useAppSelector(selectSessionInActiveSchedule);
  const selectedCourseSessions = useAppSelector(selectCourseSessionsInActiveSchedule);

  const semesters = [...new Set(CourseDetails.flatMap(course => {
    const schedules = course.schedules;
    if (schedules) {
      return schedules.map(schedule => sessionToString(schedule));
    }
  }))];

  return (
    <div>
      <div className="mb-2 flex gap-1">
        <div className="text-lg">Schedule Calendar</div>
      </div>

      <div className="relative mt-1">
        <Listbox value={selectedSession} onChange={(payload) => {
            dispatch(userSchedulesSlice.actions.updateActiveScheduleSession(stringToSession(payload)));
          }}>
          <Listbox.Label className="flex">
            Semester
          </Listbox.Label>
          <Listbox.Button
            className="relative mt-2 w-full cursor-default rounded border py-1 pl-1 pr-10 text-left transition duration-150 ease-in-out border-gray-200 sm:text-sm sm:leading-5">
          <span className="flex flex-wrap gap-1">
            {selectedSession.length === 0 ? (
              <span className="p-0.5">Select Semester</span>
            ) : (
              <span
                key={selectedSession}
                className="flex items-center gap-1 rounded px-2 py-0.5"
              >
                {selectedSession}
              </span>
            )}
          </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 stroke-gray-500 dark:stroke-zinc-400"/>
          </span>
          </Listbox.Button>
          <div className="absolute mt-1 w-full rounded shadow-lg bg-white">
            <Listbox.Options
              className="shadow-xs relative z-50 max-h-60 overflow-auto rounded py-1 text-base leading-6 bg-white focus:outline-none sm:text-sm sm:leading-5">
              {semesters.map((semester) => (
                <Listbox.Option
                  key={semester}
                  value={semester}
                  className={({active}) => {
                    return classNames(
                      "relative cursor-pointer select-none py-2 pl-3 pr-9 focus:outline-none ",
                      active ? "bg-indigo-600 text-gray-600" : "text-gray-900"
                    );
                  }}
                >
                  {({selected}) => (
                    <>
                    <span className={"block truncate"}>
                      <span
                        className={classNames(
                          "ml-1 text-gray-700",
                          selected ? "font-semibold" : "font-normal"
                        )}
                      >
                        {semester}
                      </span>
                    </span>
                      {selected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <CheckIcon className="h-5 w-5"/>
                      </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>
      <div className="overflow-y-auto h-72 my-4">
        {
          CourseDetails.filter((course) => course.schedules?.some(sched => sessionToString(sched) === selectedSession)).map((course) => {
            const schedule = course.schedules?.find(sched => sessionToString(sched) === selectedSession);
            const courseID = course.courseID;

            return (
              <div key={courseID} className="relative mb-4 p-3 rounded-md border border-black" style={{backgroundColor: selectedCourseSessions[courseID]?.Color || ""}}>
                <div className="text-md">{courseID}</div>
                {schedule?.lectures && getTimes(courseID, "Lecture", schedule.lectures, selectedCourseSessions, dispatch)}
                {schedule?.sections && getTimes(courseID, "Section", schedule.sections, selectedCourseSessions, dispatch)}
              </div>
            );
          })
        }
      </div>
    </div>
  );
};

export default SectionSelector;