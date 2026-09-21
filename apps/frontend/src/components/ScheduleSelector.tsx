import React, { useEffect, useState } from "react";
import {
  ArrowDownTrayIcon,
  ClipboardIcon,
  ShareIcon,
} from "@heroicons/react/24/solid";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { FlushedButton } from "./Buttons";
import { XMarkIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { UserSchedule, userSchedulesSlice } from "~/app/userSchedules";
import { showToast } from "./Toast";
import { useFetchCourseInfos } from "~/app/api/course";
import {
  downloadScheduleICS,
  encodeSharedSchedule,
} from "~/app/scheduleSharing";

type ScheduleSelectionProps = {
  schedule: UserSchedule;
  active: boolean;
};

const ScheduleSelection = ({ schedule, active }: ScheduleSelectionProps) => {
  const dispatch = useAppDispatch();
  const courseDetails = useFetchCourseInfos(schedule.courses);
  const { name, id } = schedule;
  const [shareableLink, setShareableLink] = useState("");
  useEffect(() => {
    setShareableLink(
      `${window.location.origin}/schedules/shared?data=${encodeURIComponent(encodeSharedSchedule(schedule))}`
    );
  }, [schedule]);

  if (active)
    return (
      <div className="mt-1 mb-1 rounded p-2 text-sm bg-gray-50">
        <div className="flex justify-between">
          <div>{name}</div>
          <XMarkIcon
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
              className="min-w-0 flex-1 px-2 bg-white"
              value={shareableLink}
              readOnly={true}
            />
            <button
              className="ml-2 inline-flex items-center rounded px-1 hover:bg-gray-100"
              onClick={() => {
                void navigator.clipboard.writeText(shareableLink).then(() =>
                  showToast({
                    message: "Copied link.",
                    icon: ClipboardIcon,
                  })
                );
              }}
            >
              <ClipboardIcon className="h-4 w-4 flex-none" />
              <div className="ml-1">Copy</div>
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            This link includes the semester and selected lecture/section times.
          </p>
          <button
            type="button"
            className="mt-2 inline-flex items-center rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
            onClick={() => {
              if (downloadScheduleICS(schedule, courseDetails)) {
                showToast({
                  message: "Exported calendar.",
                  icon: ArrowDownTrayIcon,
                });
              } else {
                showToast({
                  message: "Choose a semester before exporting.",
                  icon: ArrowDownTrayIcon,
                });
              }
            }}
          >
            <ArrowDownTrayIcon className="mr-1 h-4 w-4" />
            Export .ics
          </button>
        </div>
      </div>
    );
  else
    return (
      <div
        className="flex cursor-pointer justify-between rounded px-2 py-2 text-sm hover:bg-gray-50"
        onClick={() =>
          dispatch(userSchedulesSlice.actions.changeActiveSchedule(id))
        }
      >
        <div>{name}</div>
        <XMarkIcon
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
      <div className="mb-2 flex gap-1">
        <div className="text-lg">Schedules</div>
        <FlushedButton
          onClick={() => {
            dispatch(userSchedulesSlice.actions.createEmptySchedule());
          }}
        >
          <PlusCircleIcon className="h-5 w-5" />
        </FlushedButton>
      </div>
      <div>
        {Object.keys(savedSchedules).length > 0 ? (
          Object.entries(savedSchedules).map(([id, schedule]) => (
            <ScheduleSelection
              schedule={schedule}
              active={id === active}
              key={id}
            />
          ))
        ) : (
          <span className="text-sm text-gray-400">No schedules created.</span>
        )}
      </div>
    </div>
  );
};

export default ScheduleSelector;
