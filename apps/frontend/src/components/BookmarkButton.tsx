import React from "react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { userSlice } from "~/app/user";
import { CheckIcon } from "@heroicons/react/20/solid";
import { UserSchedule, userSchedulesSlice } from "~/app/userSchedules";
import { GetTooltip } from "~/components/GetTooltip";

interface Props {
  courseID: string;
}

const BookmarkButton = ({ courseID }: Props) => {
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector((state) => state.user.bookmarked);
  const bookmarked = bookmarks.indexOf(courseID) !== -1;

  const bookmarkCourse = () => {
    if (bookmarked) dispatch(userSlice.actions.removeBookmark(courseID));
    else dispatch(userSlice.actions.addBookmark(courseID));
  };

  const saved = useAppSelector((state) => state.schedules.saved);

  const toggleCourseInSchedule = (schedule: UserSchedule) => {
    dispatch(userSchedulesSlice.actions.changeActiveSchedule(schedule.id));
    if (schedule.courses.includes(courseID)) {
      dispatch(userSchedulesSlice.actions.removeCourseFromActiveSchedule(courseID));
    } else {
      dispatch(userSchedulesSlice.actions.addCourseToActiveSchedule(courseID));
    }
  };

  const id = `${courseID}-bookmark`

  return (
    <div>
      <PlusIcon className="h-6 w-6" data-tooltip-id={id} data-tooltip-place="bottom-end"/>
      <GetTooltip id={id}>
        <div
          className="right-0 top-full w-auto min-w-36 bg-white rounded -m-3 p-3">
          <ul>
            <li key="titlle" className="relative cursor-pointer select-none pl-3 pr-9 focus:outline-none">
              <b>Add to schedule:</b>
            </li>
            <li key="saved" className="relative cursor-pointer select-none pt-2 pl-3 pr-9 focus:outline-none"
                onClick={bookmarkCourse}>
              Saved
              {bookmarked && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <CheckIcon className="h-5 w-5" />
                </span>
              )}
            </li>
            {Object.values(saved).map((schedule) => (
              <li key={schedule.id} className="relative cursor-pointer select-none pt-2 pl-3 pr-9 focus:outline-none"
                  onClick={() => toggleCourseInSchedule(schedule)}>
                {schedule.name}
                {schedule.courses.includes(courseID) && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <CheckIcon className="h-5 w-5" />
                  </span>
                )}
              </li>
            ))}
            <li className="relative cursor-pointer select-none pt-2 pl-3 pr-9 focus:outline-none"
                onClick={() => {
                  dispatch(userSchedulesSlice.actions.createSharedSchedule([courseID]));
                }}
            >
              Create new schedule
            </li>
          </ul>
        </div>
      </GetTooltip>
    </div>
  );
};

export default BookmarkButton;
