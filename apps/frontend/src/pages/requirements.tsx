import type { NextPage } from "next";
import React, { useMemo } from "react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import {
  degreeProgress,
  labelOf,
  MAJORS,
  Profile,
  RequirementStatus,
  recommendCourses,
  requirementsForMajor,
} from "@cmucourses/profile";
import { Page } from "~/components/Page";
import Loading from "~/components/Loading";
import Link from "~/components/Link";
import { Card } from "~/components/Card";
import ProgressBar from "~/components/ProgressBar";
import { PRIMARY_BUTTON_CLASS } from "~/components/profile/fields";
import { useFetchProfile } from "~/app/api/profile";
import { useFetchCourseInfos } from "~/app/api/course";
import { displayUnits } from "~/app/utils";

const STATUS_LABEL: Record<RequirementStatus["status"], string> = {
  TAKEN: "Taken",
  IN_PROGRESS: "In progress",
  PLANNED: "Planned",
  UNMET: "Not yet",
};

const STATUS_CLASS: Record<RequirementStatus["status"], string> = {
  TAKEN: "text-green-800 bg-green-50",
  IN_PROGRESS: "text-yellow-800 bg-yellow-50",
  PLANNED: "text-blue-800 bg-blue-50",
  UNMET: "text-gray-500 bg-gray-50",
};

/** A course id in a requirement's option list, linked unless it isn't in the catalog. */
const RequirementCourseID = ({
  courseID,
  satisfied,
}: {
  courseID: string;
  satisfied: boolean;
}) => {
  // Verified against the full course catalog on 2026-09-19: 95-867 does not exist there, even
  // though the MISM handbook lists it. Every other MISM requirement course does.
  if (courseID === "95-867") {
    return (
      <span className={satisfied ? "font-medium" : undefined}>
        {courseID}{" "}
        <span className="text-gray-400 text-xs">
          (not in the course catalog)
        </span>
      </span>
    );
  }
  return (
    <Link href={`/course/${courseID}`}>
      <span className={satisfied ? "font-medium" : undefined}>{courseID}</span>
    </Link>
  );
};

const RequirementRow = ({ status }: { status: RequirementStatus }) => (
  <div className="flex items-start justify-between gap-4 border-gray-100 border-t py-2 first:border-t-0">
    <div>
      <div className="text-gray-700 text-sm">{status.requirement.label}</div>
      <div className="mt-0.5 flex flex-wrap gap-x-1 text-gray-500 text-xs">
        {status.requirement.options.map((courseID, index) => (
          <React.Fragment key={courseID}>
            {index > 0 && <span className="text-gray-400">or</span>}
            <RequirementCourseID
              courseID={courseID}
              satisfied={status.satisfiedBy === courseID}
            />
          </React.Fragment>
        ))}
        <span className="text-gray-400">
          · {status.requirement.units} units
        </span>
      </div>
    </div>
    <span
      className={`shrink-0 rounded px-2 py-0.5 text-xs ${STATUS_CLASS[status.status]}`}
    >
      {STATUS_LABEL[status.status]}
    </span>
  </div>
);

const MAX_ELECTIVE_SUGGESTIONS = 5;

const ElectiveGoalSuggestions = ({
  careers,
  skillsWant,
  skillsHave,
  excludeCourseIDs,
}: {
  careers: readonly string[];
  skillsWant: readonly string[];
  skillsHave: readonly string[];
  excludeCourseIDs: readonly string[];
}) => {
  const suggestions = useMemo(
    () =>
      recommendCourses({
        careers,
        skillsWant,
        skillsHave,
        takenCourseIDs: excludeCourseIDs,
        limit: MAX_ELECTIVE_SUGGESTIONS,
      }),
    [careers, skillsWant, skillsHave, excludeCourseIDs]
  );

  if (careers.length === 0 && skillsWant.length === 0) {
    return (
      <p className="text-gray-400 text-sm">
        <Link href="/profile">Add career goals on your Profile</Link> to see
        elective suggestions here.
      </p>
    );
  }

  if (suggestions.length === 0) {
    return (
      <p className="text-gray-400 text-sm">
        No unmet elective suggestions right now.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {suggestions.map((s) => (
        <div key={s.courseID} className="text-gray-700 text-sm">
          <Link href={`/course/${s.courseID}`}>{s.courseID}</Link>
          {s.reasons.length > 0 && (
            <span className="ml-2 text-gray-400 text-xs">
              {s.reasons.join(", ")}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

const ElectiveUnits = ({
  requiredUnits,
  coreCourseIDs,
  takenCourseIDs,
}: {
  requiredUnits: number;
  coreCourseIDs: ReadonlySet<string>;
  takenCourseIDs: readonly string[];
}) => {
  const electiveCourseIDs = takenCourseIDs.filter(
    (id) => !coreCourseIDs.has(id)
  );
  const courses = useFetchCourseInfos(electiveCourseIDs);
  const courseByID = new Map(courses.map((c) => [c.courseID, c]));

  let earned = 0;
  let variableCount = 0;
  for (const courseID of electiveCourseIDs) {
    const units = courseByID.get(courseID)?.units;
    if (units === undefined) continue; // still loading
    const parsed = parseFloat(units);
    if (Number.isNaN(parsed)) variableCount += 1;
    else earned += parsed;
  }

  return (
    <div>
      <ProgressBar
        value={earned}
        max={requiredUnits}
        label={`${earned} / ${requiredUnits} elective units`}
      />
      {variableCount > 0 && (
        <p className="mt-1 text-gray-400 text-xs">
          {variableCount} course{variableCount === 1 ? "" : "s"} with variable
          units aren&apos;t counted toward this total.
        </p>
      )}
      {electiveCourseIDs.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-2 text-gray-500 text-xs">
          {electiveCourseIDs.map((courseID) => (
            <span key={courseID}>
              <Link href={`/course/${courseID}`}>{courseID}</Link>
              {courseByID.get(courseID) &&
                ` (${displayUnits(courseByID.get(courseID)!.units)})`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const GenericRequirementsPlanner = ({ profile }: { profile: Profile }) => {
  const recordedIDs = profile.courses.map((course) => course.courseID);
  const plannedIDs = profile.plannedCourses.map((course) => course.courseID);
  const details = useFetchCourseInfos([
    ...new Set([...recordedIDs, ...plannedIDs]),
  ]);
  const unitsByID = new Map(
    details.map((course) => [
      course.courseID,
      Number.isNaN(parseFloat(course.units)) ? 0 : parseFloat(course.units),
    ])
  );
  const completedUnits = profile.courses
    .filter((course) => course.status === "TAKEN")
    .reduce((sum, course) => sum + (unitsByID.get(course.courseID) ?? 0), 0);
  const plannedUnits = profile.plannedCourses.reduce(
    (sum, course) => sum + (unitsByID.get(course.courseID) ?? 0),
    0
  );
  const programs = profile.academic?.majors ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <Card.Header>Program planning overview</Card.Header>
        <p className="mt-1 text-gray-400 text-xs">
          {programs.length > 0
            ? programs.map((id) => labelOf(MAJORS, id)).join(", ")
            : "Add a program on your Profile."}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-gray-700 text-sm">
          <div className="rounded bg-gray-50 p-3">
            <div className="text-gray-400 text-xs">Completed</div>
            <div>{completedUnits} catalog units</div>
          </div>
          <div className="rounded bg-gray-50 p-3">
            <div className="text-gray-400 text-xs">Future plan</div>
            <div>{plannedUnits} catalog units</div>
          </div>
        </div>
        <p className="mt-3 text-gray-400 text-xs">
          A verified course-by-course checklist is currently available for MISM.
          For other programs, this planner tracks your semesters and career fit
          without claiming unofficial courses satisfy a formal requirement.
        </p>
      </Card>
      <Card>
        <Card.Header>Your future semesters</Card.Header>
        {profile.plannedCourses.length === 0 ? (
          <p className="mt-2 text-gray-400 text-sm">
            Add courses in the Future course plan on your{" "}
            <Link href="/profile#plan">Profile</Link>.
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            {profile.plannedCourses.map((course) => (
              <div
                key={`${course.year}:${course.semester}:${course.courseID}`}
                className="flex justify-between text-gray-700 text-sm"
              >
                <Link href={`/course/${course.courseID}`}>
                  {course.courseID}
                </Link>
                <span className="capitalize text-gray-400">
                  {course.semester} {course.year}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <Card.Header>Courses balancing your career goals</Card.Header>
        <div className="mt-2">
          <ElectiveGoalSuggestions
            careers={profile.careers}
            skillsWant={profile.skillsWant}
            skillsHave={profile.skillsHave}
            excludeCourseIDs={[...recordedIDs, ...plannedIDs]}
          />
        </div>
      </Card>
    </div>
  );
};

const RequirementsContent = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { data: profile } = useFetchProfile();

  if (!isLoaded) return <Loading />;

  if (!isSignedIn) {
    return (
      <div className="mt-6 text-center text-gray-400">
        <p>Sign in to track your degree requirements.</p>
        <div className="mt-4 inline-flex">
          <div className={PRIMARY_BUTTON_CLASS}>
            <SignInButton />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return <Loading />;

  const majorID = profile.academic?.majors.find(
    (id) => requirementsForMajor(id) !== null
  );
  const major = majorID ? requirementsForMajor(majorID) : null;

  if (!major || !majorID) {
    return (
      <div className="m-auto max-w-4xl space-y-4 p-6">
        <h1 className="text-gray-700 text-lg">Degree Requirements</h1>
        <GenericRequirementsPlanner profile={profile} />
      </div>
    );
  }

  const takenCourses = [
    ...profile.courses.map((c) => ({ courseID: c.courseID, status: c.status })),
    ...profile.plannedCourses.map((c) => ({
      courseID: c.courseID,
      status: "PLANNED" as const,
    })),
  ];
  const progress = degreeProgress(majorID, takenCourses)!;
  const coreCourseIDs = new Set(major.core.flatMap((r) => r.options));
  const takenCourseIDs = profile.courses.map((c) => c.courseID);

  return (
    <div className="m-auto max-w-4xl space-y-4 p-6">
      <div>
        <h1 className="text-gray-700 text-lg">Degree Requirements</h1>
        <p className="text-gray-400 text-xs">{major.source}</p>
      </div>

      <Card>
        <Card.Header>Core requirements</Card.Header>
        <div className="mt-2">
          <ProgressBar
            value={progress.coreUnitsEarned}
            max={progress.coreUnitsTotal}
            label={`${progress.coreUnitsEarned} / ${progress.coreUnitsTotal} core units`}
          />
        </div>
        <div className="mt-3">
          {progress.requirements.map((status) => (
            <RequirementRow key={status.requirement.id} status={status} />
          ))}
        </div>
      </Card>

      <Card>
        <Card.Header>Electives</Card.Header>
        <div className="mt-2">
          <ElectiveUnits
            requiredUnits={progress.electiveUnitsRequired}
            coreCourseIDs={coreCourseIDs}
            takenCourseIDs={takenCourseIDs}
          />
        </div>
      </Card>

      <Card>
        <Card.Header>Elective suggestions toward your goals</Card.Header>
        <div className="mt-2">
          <ElectiveGoalSuggestions
            careers={profile.careers}
            skillsWant={profile.skillsWant}
            skillsHave={profile.skillsHave}
            excludeCourseIDs={[...coreCourseIDs, ...takenCourseIDs]}
          />
        </div>
      </Card>
    </div>
  );
};

const RequirementsPage: NextPage = () => {
  return (
    <Page
      activePage="requirements"
      title="Requirements - CMU Courses"
      content={<RequirementsContent />}
    />
  );
};

export default RequirementsPage;
