import React from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { BusyBlock, LIMITS, Profile } from "@cmucourses/profile";
import { classNames } from "~/app/utils";
import { INPUT_CLASS, SECONDARY_BUTTON_CLASS, Select } from "./fields";
import {
  DAYS,
  DAY_OPTIONS,
  minutesToTime,
  MODALITY_OPTIONS,
  timeToMinutes,
} from "./options";
import { ProfileSection, useDraft } from "./ProfileSection";

// Lets the preference be cleared back to "not set".
const NO_PREFERENCE = { value: null, label: "No preference" } as const;

const NEW_BLOCK: BusyBlock = {
  day: 1,
  begin: 9 * 60,
  end: 10 * 60,
  label: null,
};

const BusyBlockRow = ({
  block,
  onChange,
  onRemove,
}: {
  block: BusyBlock;
  onChange: (block: BusyBlock) => void;
  onRemove: () => void;
}) => (
  <div className="flex flex-wrap items-center gap-2 text-gray-500 text-sm">
    <Select
      inline
      className="w-36"
      value={block.day}
      options={DAY_OPTIONS}
      onChange={(day) => onChange({ ...block, day })}
    />
    <input
      type="time"
      aria-label="Start time"
      className={INPUT_CLASS}
      value={minutesToTime(block.begin)}
      onChange={(e) => {
        const begin = timeToMinutes(e.target.value);
        if (begin !== null) onChange({ ...block, begin });
      }}
    />
    <span>-</span>
    <input
      type="time"
      aria-label="End time"
      className={INPUT_CLASS}
      value={minutesToTime(block.end % 1440)}
      onChange={(e) => {
        const end = timeToMinutes(e.target.value);
        // "00:00" as an end time means midnight at the end of the day.
        if (end !== null) onChange({ ...block, end: end === 0 ? 1440 : end });
      }}
    />
    <input
      className={classNames(INPUT_CLASS, "flex-1")}
      placeholder="Label (optional)"
      maxLength={LIMITS.busyBlockLabel}
      value={block.label ?? ""}
      onChange={(e) => onChange({ ...block, label: e.target.value })}
    />
    <button
      type="button"
      aria-label="Remove busy time"
      title="Remove"
      className="rounded p-1 text-gray-500 hover:bg-gray-50"
      onClick={onRemove}
    >
      <XMarkIcon className="h-5 w-5" />
    </button>
  </div>
);

export const TimeSection = ({ profile }: { profile: Profile }) => {
  const { draft, setDraft, dirty } = useDraft({
    modality: profile.modality,
    busyBlocks: profile.busyBlocks,
    schedulePreferences: profile.schedulePreferences,
  });
  const setBlocks = (busyBlocks: BusyBlock[]) =>
    setDraft({ ...draft, busyBlocks });

  return (
    <ProfileSection
      id="time"
      title="Time & format"
      description="Your weekly busy times are used to avoid schedule conflicts."
      profile={profile}
      dirty={dirty}
      patch={draft}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500 text-sm">
        <div className="mr-2">Preferred format</div>
        {[...MODALITY_OPTIONS, NO_PREFERENCE].map(({ value, label }) => (
          <label key={String(value)}>
            <input
              type="radio"
              name="modality"
              className="mr-1"
              checked={draft.modality === value}
              onChange={() => setDraft({ ...draft, modality: value })}
            />{" "}
            {label}
          </label>
        ))}
      </div>
      <div className="space-y-2">
        <div className="text-gray-500 text-sm">Weekly busy times</div>
        {draft.busyBlocks.length === 0 && (
          <div className="text-gray-400 text-sm">No busy times yet.</div>
        )}
        {draft.busyBlocks.map((block, index) => (
          <BusyBlockRow
            key={index}
            block={block}
            onChange={(next) =>
              setBlocks(
                draft.busyBlocks.map((other, i) => (i === index ? next : other))
              )
            }
            onRemove={() =>
              setBlocks(draft.busyBlocks.filter((_, i) => i !== index))
            }
          />
        ))}
        {draft.busyBlocks.length < LIMITS.busyBlocks && (
          <button
            type="button"
            className={SECONDARY_BUTTON_CLASS}
            onClick={() => setBlocks([...draft.busyBlocks, NEW_BLOCK])}
          >
            Add busy time
          </button>
        )}
      </div>
      <div className="space-y-3 border-gray-100 border-t pt-4">
        <div>
          <div className="text-gray-500 text-sm">Course preferences</div>
          <div className="text-gray-400 text-xs">
            Used to rank generated schedules; busy times remain hard conflicts.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-gray-500 text-sm">
          <span>Prefer classes between</span>
          <input
            type="time"
            aria-label="Preferred earliest start"
            className={INPUT_CLASS}
            value={
              draft.schedulePreferences.earliestStart === null
                ? ""
                : minutesToTime(draft.schedulePreferences.earliestStart)
            }
            onChange={(e) =>
              setDraft({
                ...draft,
                schedulePreferences: {
                  ...draft.schedulePreferences,
                  earliestStart: e.target.value
                    ? timeToMinutes(e.target.value)
                    : null,
                },
              })
            }
          />
          <span>and</span>
          <input
            type="time"
            aria-label="Preferred latest end"
            className={INPUT_CLASS}
            value={
              draft.schedulePreferences.latestEnd === null
                ? ""
                : minutesToTime(draft.schedulePreferences.latestEnd % 1440)
            }
            onChange={(e) =>
              setDraft({
                ...draft,
                schedulePreferences: {
                  ...draft.schedulePreferences,
                  latestEnd: e.target.value
                    ? timeToMinutes(e.target.value)
                    : null,
                },
              })
            }
          />
        </div>
        <div className="text-gray-500 text-sm">
          <div className="mb-1">Preferred class days</div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {DAYS.slice(1, 6).map((day, offset) => {
              const dayNumber = offset + 1;
              const selected =
                draft.schedulePreferences.preferredDays.includes(dayNumber);
              return (
                <label key={day}>
                  <input
                    type="checkbox"
                    className="mr-1"
                    checked={selected}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        schedulePreferences: {
                          ...draft.schedulePreferences,
                          preferredDays: e.target.checked
                            ? [
                                ...draft.schedulePreferences.preferredDays,
                                dayNumber,
                              ].sort()
                            : draft.schedulePreferences.preferredDays.filter(
                                (value) => value !== dayNumber
                              ),
                        },
                      })
                    }
                  />
                  {day.slice(0, 3)}
                </label>
              );
            })}
          </div>
        </div>
        <label className="block text-gray-500 text-sm">
          <input
            type="checkbox"
            className="mr-2"
            checked={draft.schedulePreferences.compactDays}
            onChange={(e) =>
              setDraft({
                ...draft,
                schedulePreferences: {
                  ...draft.schedulePreferences,
                  compactDays: e.target.checked,
                },
              })
            }
          />
          Prefer schedules concentrated into fewer days
        </label>
      </div>
    </ProfileSection>
  );
};
