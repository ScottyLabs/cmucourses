import React, { Dispatch, SetStateAction } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { Listbox, RadioGroup } from "@headlessui/react";
import { classNames, compareSessions, sessionToString, stringToSession } from "~/app/utils";
import {CheckIcon, ChevronDownIcon, ChevronUpIcon} from "@heroicons/react/20/solid";
import { Schedule } from "~/app/types";
import {
  CourseSessions,
  selectCourseSessionsInActiveSchedule,
  selectSessionInActiveSchedule,
  userSchedulesSlice
} from "~/app/userSchedules";
import { useFetchCourseInfos } from "~/app/api/course";
import { userSlice } from "~/app/user";
import { SCHED_VIEW } from "~/app/constants";
import {FlushedButton} from "~/components/Buttons";
import {uiSlice} from "~/app/ui";

interface Props {
  courseIDs: string[];
}

const getTimes = (courseID: string, schedule: Schedule, selectedSessions: CourseSessions, dispatch: Dispatch<SetStateAction<any>>) => {
  const sessionType = schedule.sections ? "Section" : "Lecture";
  const sessions = schedule.sections || schedule.lectures

  const selectedSession = selectedSessions[courseID]?.[sessionType] || "";

  return (
    <div>
      <RadioGroup
        className="grid grid-flow-col divide-x divide-gray-400 justify-stretch rounded-md border border-black p-1"
        value={selectedSession} onChange={(payload) => {
        if (sessionType === "Section") {
          const section = schedule.sections.find((section) => section.name === payload);
          const lecture = schedule.lectures.find((lecture) => lecture.name === section?.lecture);
          if (lecture)
            dispatch(userSchedulesSlice.actions.updateActiveScheduleCourseSession({ courseID, sessionType: "Lecture", session: lecture.name }));
        }
        dispatch(userSchedulesSlice.actions.updateActiveScheduleCourseSession({ courseID, sessionType, session: payload as string }));
      }}>
        {sessions.map((lecture) => (
          <RadioGroup.Option
            key={lecture.name}
            value={lecture.name}
            className={({active}) => {
              return classNames(
                "flex relative justify-center cursor-pointer select-none focus:outline-none",
                active ? "bg-indigo-600 text-gray-600" : "text-gray-900"
              );
            }}
          >
            {({checked}) => (
              <span className="block truncate">
                <span className={classNames("text-gray-700", checked ? "font-semibold" : "font-normal")}>
                  {lecture.name}
                </span>
              </span>
            )}
          </RadioGroup.Option>
        ))}
      </RadioGroup>
    </div>
  )
}

const SectionSelector = ({ courseIDs }: Props) => {
  const dispatch = useAppDispatch();
  const CourseDetails = useFetchCourseInfos(courseIDs);

  const selectedSession = useAppSelector(selectSessionInActiveSchedule);
  const selectedCourseSessions = useAppSelector(selectCourseSessionsInActiveSchedule);
  const scheduleView = useAppSelector((state) => state.user.scheduleView);

  const semesters = [...new Set(CourseDetails.flatMap(course => {
    const schedules: Schedule[] = course.schedules;
    if (schedules) {
      return schedules.map(schedule => sessionToString(schedule));
    }
  }))].sort((a, b) => {
    return compareSessions(stringToSession(a || ""), stringToSession(b || ""));
  });

  return (
    <div className="pt-4">
      <div className="mb-2 flex gap-1 justify-between">
        <div className="text-lg">Schedule Calendar</div>
        <FlushedButton onClick={() => dispatch(userSlice.actions.toggleScheduleView())}>
            {scheduleView === SCHED_VIEW ? "Show" : "Hide"}
        </FlushedButton>
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
              className="shadow-xs relative z-50 max-h-60 rounded py-1 text-base leading-6 bg-white focus:outline-none sm:text-sm sm:leading-5 overflow-auto">
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
      <div className="my-4">
        {
          CourseDetails.filter((course) => course.schedules?.some((sched: Schedule) => sessionToString(sched) === selectedSession)).map((course) => {
            const schedule = course.schedules?.find((sched: Schedule) => sessionToString(sched) === selectedSession);
            const courseID = course.courseID;

            const sessionType = schedule.sections ? "Section" : "Lecture";

            return (
              <div key={courseID} className="relative mb-4 p-3 rounded-md border border-black" style={{backgroundColor: selectedCourseSessions[courseID]?.Color || ""}}>
                <div className="flex justify-between text-lg">
                  {courseID} (Select {sessionType})
                  <span
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(userSchedulesSlice.actions.removeCourseFromActiveSchedule(courseID));
                    }}
                  >
                    &#10005;
                  </span>
                </div>
                {getTimes(courseID, schedule, selectedCourseSessions, dispatch)}
              </div>
            );
          })
        }
      </div>
      <div className="text-white h-2" />
    </div>
  );
};

export default SectionSelector;