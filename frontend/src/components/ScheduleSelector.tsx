import React from "react";
import { ShareIcon } from "@heroicons/react/solid";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { FlushedButton } from "./Buttons";
import { userSlice } from "../app/user";
import { XIcon } from "@heroicons/react/outline";

const ScheduleSelection = ({ name, id, courses, active }) => {
  const dispatch = useAppDispatch();

  if (active)
    return (
      <div className="bg-gray-50 mt-1 mb-1 rounded-md p-2 text-sm">
        <div className="flex justify-between">
          <div>{name}</div>
          <XIcon
            className="h-4 w-4 cursor-pointer"
            onClick={() => dispatch(userSlice.actions.deleteSchedule(id))}
          />
        </div>
        <div className="">
          <div className="mt-1 flex items-center">
            <ShareIcon className="mr-2 h-4 w-4 flex-none" />
            <input
              onFocus={(e) => e.target.select()}
              className="bg-white min-w-0 flex-1 px-2"
              value={
                window.location.host +
                "/schedules/shared?courses=" +
                courses.join(",")
              }
              readOnly={true}
            />
          </div>
          <p className="text-gray-400 mt-1 text-xs">
            Use this to share this schedule with others.
          </p>
        </div>
      </div>
    );
  else
    return (
      <div
        className="flex cursor-pointer justify-between rounded-md px-2 py-2 text-sm hover:bg-gray-50"
        onClick={() => dispatch(userSlice.actions.selectSchedule(id))}
      >
        <div>{name}</div>
        <XIcon
          className="h-4 w-4 cursor-pointer"
          onClick={() => {
            dispatch(userSlice.actions.deleteSchedule(id));
            return false;
          }}
        />
      </div>
    );
};

const ScheduleSelector = () => {
  const dispatch = useAppDispatch();
  const savedSchedules = useAppSelector((state) => state.user.schedules.saved);
  const active = useAppSelector((state) => state.user.schedules.active);
  const current = useAppSelector((state) => state.user.schedules.current);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <div className="text-md">Schedules</div>
        <FlushedButton
          onClick={() => {
            dispatch(userSlice.actions.createSchedule());
          }}
        >
          Create New
        </FlushedButton>
      </div>
      <div>
        {savedSchedules.length > 0 ? (
          savedSchedules.map((schedule, index) => (
            <ScheduleSelection
              name={schedule.name}
              courses={schedule.courses}
              id={index}
              active={index === active}
              key={index}
            />
          ))
        ) : (
          <ScheduleSelection
            name={"My Schedule"}
            courses={current}
            id={-1}
            active={true}
          />
        )}
      </div>
    </div>
  );
};

export default ScheduleSelector;
