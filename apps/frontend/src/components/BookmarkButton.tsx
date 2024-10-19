import React, { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { userSlice } from "~/app/user";
import { CheckIcon } from "@heroicons/react/20/solid";
import { UserSchedule, userSchedulesSlice } from "~/app/userSchedules";

interface Props {
  courseID: string;
}

const BookmarkButton = ({courseID}: Props) => {
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector((state) => state.user.bookmarked);
  const bookmarked = bookmarks.indexOf(courseID) !== -1;

  const bookmarkCourse = () => {
    if (bookmarked) dispatch(userSlice.actions.removeBookmark(courseID));
    else dispatch(userSlice.actions.addBookmark(courseID));
  };

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const saved = useAppSelector((state) => state.schedules.saved);

  const toggleCourseInSchedule = (schedule: UserSchedule) => {
    dispatch(userSchedulesSlice.actions.changeActiveSchedule(schedule.id));
    if (schedule.courses.includes(courseID)) {
      dispatch(userSchedulesSlice.actions.removeCourseFromActiveSchedule(courseID));
    } else {
      dispatch(userSchedulesSlice.actions.addCourseToActiveSchedule(courseID));
    }
  };

  return (
    <div className="relative" onMouseEnter={() => setDropdownVisible(true)} onMouseLeave={() => setDropdownVisible(false)}>
      {dropdownVisible ? (
        <div className="absolute right-0 top-full w-auto p-2 min-w-36 bg-white shadow-lg rounded-md border border-grey-50">
          <ul>
            <li key="saved" className="relative cursor-pointer select-none pl-3 pr-9 focus:outline-none"
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
          </ul>
        </div>
      ) : (
        <PlusIcon className="h-6 w-6"/>
      )}
    </div>
  );
};

export default BookmarkButton;
