import React, { Dispatch, SetStateAction } from "react";
import {useAppDispatch, useAppSelector} from "~/app/hooks";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { Listbox } from "@headlessui/react";
import {classNames, sessionToString} from "~/app/utils";
import { CheckIcon } from "@heroicons/react/20/solid";
import {selectCourseResults} from "~/app/cache";
import { Lecture, Section } from "~/app/types";
import { userSlice } from "~/app/user";

interface Props {
  courseIDs: string[];
}

interface courseSessions {
  [courseID: string]: {
    [sessionType: string]: string;
  };
}

const getTimes = (courseID: string, sessionType: string, sessions: Lecture[] | Section[], selectedSessions: courseSessions, dispatch: Dispatch<SetStateAction<any>>) => {
  const selectedSession = selectedSessions[courseID]?.[sessionType] || "";

  return (
    <Listbox value={selectedSession} onChange={(payload) => {
        dispatch(userSlice.actions.setSelectedSessions({
          ...selectedSessions,
          [courseID]: {
            ...selectedSessions[courseID],
            [sessionType]: payload
          }
        }));
      }}>
      <Listbox.Label className="flex">
        {sessionType}
      </Listbox.Label>
      <Listbox.Button
        className="relative mt-2 w-full cursor-default rounded border py-1 pl-1 pr-10 text-left transition duration-150 ease-in-out border-gray-200 sm:text-sm sm:leading-5">
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
      <div className="absolute mt-1 w-full rounded shadow-lg bg-white">
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
  )
}

const SectionSelector = ({ courseIDs }: Props) => {
  const dispatch = useAppDispatch();
  const CourseDetails = useAppSelector(selectCourseResults(courseIDs)).filter(x => x !== undefined);
  const selectedSemester = useAppSelector((state) => state.user.selectedSemester);
  const selectedSessions = useAppSelector((state) => state.user.selectedSessions);

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
        <Listbox value={selectedSemester} onChange={(payload) => {
            dispatch(userSlice.actions.setSelectedSemester(payload));
            const courseIDs = CourseDetails.filter((course) => course.schedules?.some(sched => sessionToString(sched) === payload)).map(course => course.courseID);
            dispatch(userSlice.actions.setSelectedSessions(courseIDs.reduce((acc: courseSessions, courseID) => {
              acc[courseID] = {Lecture: "", Section: ""};
              return acc;
            }, {})));
          }}>
          <Listbox.Label className="flex">
            Semester
          </Listbox.Label>
          <Listbox.Button
            className="relative mt-2 w-full cursor-default rounded border py-1 pl-1 pr-10 text-left transition duration-150 ease-in-out border-gray-200 sm:text-sm sm:leading-5">
          <span className="flex flex-wrap gap-1">
            {selectedSemester.length === 0 ? (
              <span className="p-0.5">Select Semester</span>
            ) : (
              <span
                key={selectedSemester}
                className="flex items-center gap-1 rounded px-2 py-0.5"
              >
                {selectedSemester}
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
          CourseDetails.filter((course) => course.schedules?.some(sched => sessionToString(sched) === selectedSemester)).map((course) => {
            const schedule = course.schedules?.find(sched => sessionToString(sched) === selectedSemester);
            const courseID = course.courseID;

            console.log("Schedule", schedule)
            console.log("Lectures", schedule?.lectures)

            return (
              <div key={courseID} className="relative mb-4">
                <div className="text-md">{courseID}</div>
                {schedule?.lectures && getTimes(courseID, "Lecture", schedule.lectures, selectedSessions, dispatch)}
                {schedule?.sections && getTimes(courseID, "Section", schedule.sections, selectedSessions, dispatch)}
              </div>
            );
          })
        }
      </div>
    </div>
  );
};

export default SectionSelector;