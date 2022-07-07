import React from "react";
import { ClipboardCopyIcon, ShareIcon } from "@heroicons/react/solid";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { FlushedButton } from "./Buttons";
import { XIcon } from "@heroicons/react/outline";
import { userSchedulesSlice } from "../app/userSchedules";
import { showToast } from "./Toast";

const ScheduleSelection = ({ name, id, courses, active }) => {
  const dispatch = useAppDispatch();
  const shareableLink =
    window.location.host + "/schedules/shared?courses=" + courses.join(",");

  if (active)
    return (
      <div className="bg-gray-50 mt-1 mb-1 rounded-md p-2 text-sm">
        <div className="flex justify-between">
          <div>{name}</div>
          <XIcon
            className="h-4 w-4 cursor-pointer"
            onClick={() =>
              dispatch(userSchedulesSlice.actions.deleteSchedule(id))
            }
          />
        </div>
        <div className="">
          <div className="mt-1 flex items-center">
            <ShareIcon className="mr-2 h-4 w-4 flex-none" />
            <input
              onFocus={(e) => e.target.select()}
              className="bg-white min-w-0 flex-1 px-2"
              value={shareableLink}
              readOnly={true}
            />
            <button
              className="ml-2 inline-flex items-center rounded px-1 hover:bg-gray-100"
              onClick={() => {
                navigator.clipboard.writeText(shareableLink);
                showToast({
                  message: "Copied link.",
                  icon: ClipboardCopyIcon,
                });
              }}
            >
              <ClipboardCopyIcon className="h-4 w-4 flex-none" />
              <div className="ml-1">Copy</div>
            </button>
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
        onClick={() =>
          dispatch(userSchedulesSlice.actions.changeActiveSchedule(id))
        }
      >
        <div>{name}</div>
        <XIcon
          className="h-4 w-4 cursor-pointer"
          onClick={(e) => {
            dispatch(userSchedulesSlice.actions.deleteSchedule(id));
            e.stopPropagation();
          }}
        />
      </div>
    );
};

const ScheduleSelector = () => {
  const dispatch = useAppDispatch();
  const savedSchedules = useAppSelector((state) => state.schedules.saved);
  const active = useAppSelector((state) => state.schedules.active);

  return (
    <div>
      <div className="mb-2 flex items-baseline gap-3">
        <div className="text-md">Schedules</div>
        <FlushedButton
          onClick={() => {
            dispatch(userSchedulesSlice.actions.createEmptySchedule());
          }}
        >
          Create New
        </FlushedButton>
      </div>
      <div>
        {Object.keys(savedSchedules).length > 0
          ? Object.entries(savedSchedules).map(([id, schedule], index) => (
              <ScheduleSelection
                name={schedule.name}
                courses={schedule.courses}
                id={id}
                active={id === active}
                key={id}
              />
            ))
          : "No schedules created."}
      </div>
    </div>
  );
};

export default ScheduleSelector;
