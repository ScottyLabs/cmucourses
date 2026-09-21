import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import {
  LIMITS,
  PlannedCourse,
  Profile,
  ProfileSemester,
} from "@cmucourses/profile";
import Link from "~/components/Link";
import { useCourseNames } from "~/app/api/course";
import { CoursePicker } from "./CoursePicker";
import { ProfileSection, useDraft } from "./ProfileSection";
import { SECONDARY_BUTTON_CLASS, Select } from "./fields";
import { PLAN_YEAR_OPTIONS, SEMESTER_OPTIONS } from "./options";

const currentYear = String(new Date().getFullYear());

export const PlanSection = ({ profile }: { profile: Profile }) => {
  const { draft, setDraft, dirty } = useDraft(profile.plannedCourses);
  const { data: names } = useCourseNames();
  const [adding, setAdding] = useState<{
    courseID: string | null;
    semester: ProfileSemester;
    year: string;
  }>({ courseID: null, semester: "fall", year: currentYear });

  const add = () => {
    if (!adding.courseID) return;
    const next: PlannedCourse = {
      courseID: adding.courseID,
      semester: adding.semester,
      year: adding.year,
    };
    setDraft([
      ...draft.filter(
        (course) =>
          !(
            course.courseID === next.courseID &&
            course.semester === next.semester &&
            course.year === next.year
          )
      ),
      next,
    ]);
    setAdding({ ...adding, courseID: null });
  };

  return (
    <ProfileSection
      id="plan"
      title="Future course plan"
      description="Place courses into future semesters. The planner uses this alongside requirements and career goals."
      profile={profile}
      dirty={dirty}
      patch={{ plannedCourses: draft }}
    >
      {draft.length === 0 && (
        <div className="text-gray-400 text-sm">No planned courses yet.</div>
      )}
      <ul className="divide-y divide-gray-100">
        {[...draft]
          .sort((a, b) =>
            `${a.year}:${a.semester}:${a.courseID}`.localeCompare(
              `${b.year}:${b.semester}:${b.courseID}`
            )
          )
          .map((course) => (
            <li
              key={`${course.year}:${course.semester}:${course.courseID}`}
              className="flex items-center gap-2 py-2 text-gray-700 text-sm"
            >
              <div className="min-w-0 flex-1 truncate">
                <Link href={`/course/${course.courseID}`}>
                  {course.courseID}
                </Link>
                <span className="ml-2">{names?.get(course.courseID)}</span>
              </div>
              <span className="capitalize text-gray-500">
                {course.semester} {course.year}
              </span>
              <button
                type="button"
                aria-label={`Remove ${course.courseID} from plan`}
                className="rounded p-1 text-gray-500 hover:bg-gray-50"
                onClick={() =>
                  setDraft(
                    draft.filter(
                      (item) =>
                        !(
                          item.courseID === course.courseID &&
                          item.semester === course.semester &&
                          item.year === course.year
                        )
                    )
                  )
                }
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </li>
          ))}
      </ul>
      {draft.length < LIMITS.plannedCourses && (
        <div className="flex flex-wrap items-center gap-2">
          <CoursePicker
            value={adding.courseID}
            onChange={(courseID) => setAdding({ ...adding, courseID })}
            exclude={draft.map((course) => course.courseID)}
          />
          <Select
            inline
            className="w-28"
            value={adding.semester}
            options={SEMESTER_OPTIONS.filter(
              (option): option is { value: ProfileSemester; label: string } =>
                option.value !== null
            )}
            onChange={(semester) => setAdding({ ...adding, semester })}
          />
          <Select
            inline
            className="w-24"
            value={adding.year}
            options={PLAN_YEAR_OPTIONS}
            onChange={(year) => setAdding({ ...adding, year })}
          />
          <button
            type="button"
            className={SECONDARY_BUTTON_CLASS}
            disabled={!adding.courseID}
            onClick={add}
          >
            Add to plan
          </button>
        </div>
      )}
    </ProfileSection>
  );
};
