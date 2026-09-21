import type { NextPage } from "next";
import React, { useMemo, useState } from "react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import {
  SOCIAL_REACTIONS,
  type PublishedSchedule,
  type SocialDirectoryProfile,
} from "@cmucourses/profile";
import { Page } from "~/components/Page";
import { Card } from "~/components/Card";
import Link from "~/components/Link";
import { useFetchProfile } from "~/app/api/profile";
import {
  usePublishSocialSchedule,
  useReactToSchedule,
  useSocialDirectory,
  useToggleFollow,
} from "~/app/api/social";
import { useAppSelector } from "~/app/hooks";
import { selectActiveUserSchedule } from "~/app/userSchedules";
import { PRIMARY_BUTTON_CLASS } from "~/components/profile/fields";
import { Pill } from "~/components/CourseTags";

const toPublishedSchedule = (
  schedule: ReturnType<typeof selectActiveUserSchedule>
): PublishedSchedule | null => {
  if (!schedule || schedule.session.semester === "" || !schedule.session.year)
    return null;
  return {
    name: schedule.name,
    semester: schedule.session.semester,
    year: schedule.session.year,
    courses: schedule.courses.map((courseID) => ({
      courseID,
      lecture: schedule.courseSessions[courseID]?.Lecture || null,
      section: schedule.courseSessions[courseID]?.Section || null,
    })),
  };
};

const ProfileCard = ({
  person,
  ownCourses,
  ownInterests,
}: {
  person: SocialDirectoryProfile;
  ownCourses: ReadonlySet<string>;
  ownInterests: ReadonlySet<string>;
}) => {
  const follow = useToggleFollow();
  const react = useReactToSchedule();
  const commonCourses = [
    ...new Set([
      ...person.currentCourseIDs,
      ...(person.plannedSchedule?.courses.map((course) => course.courseID) ??
        []),
    ]),
  ].filter((course) => ownCourses.has(course));
  const commonInterests = [...person.careers, ...person.skills].filter((item) =>
    ownInterests.has(item)
  );

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Card.Header>{person.displayName}</Card.Header>
          {person.bio && (
            <p className="mt-1 text-gray-500 text-sm">{person.bio}</p>
          )}
        </div>
        <button
          type="button"
          className={PRIMARY_BUTTON_CLASS}
          disabled={follow.isPending}
          onClick={() =>
            follow.mutate({
              profileID: person.profileID,
              follow: !person.following,
            })
          }
        >
          {person.following ? "Connected" : "Connect"}
        </button>
      </div>

      {commonCourses.length > 0 && (
        <div className="mt-3">
          <div className="text-gray-400 text-xs">Courses you share</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {commonCourses.map((course) => (
              <Pill key={course} highlighted>
                {course}
              </Pill>
            ))}
          </div>
        </div>
      )}

      {commonInterests.length > 0 && (
        <div className="mt-3 text-gray-500 text-xs">
          Similar interests: {commonInterests.length}
        </div>
      )}

      {person.currentCourseIDs.length > 0 && (
        <div className="mt-3">
          <div className="text-gray-400 text-xs">Taking now</div>
          <div className="mt-1 flex flex-wrap gap-x-2 text-sm">
            {person.currentCourseIDs.map((courseID) => (
              <Link key={courseID} href={`/course/${courseID}`}>
                {courseID}
              </Link>
            ))}
          </div>
        </div>
      )}

      {person.plannedSchedule && (
        <div className="mt-3 rounded bg-gray-50 p-3">
          <div className="text-gray-700 text-sm">
            {person.plannedSchedule.name}
          </div>
          <div className="capitalize text-gray-400 text-xs">
            {person.plannedSchedule.semester} {person.plannedSchedule.year}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-2 text-sm">
            {person.plannedSchedule.courses.map((course) => (
              <Link key={course.courseID} href={`/course/${course.courseID}`}>
                {course.courseID}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {SOCIAL_REACTIONS.map((reaction) => (
              <button
                type="button"
                key={reaction}
                className={`rounded border px-2 py-1 text-xs ${
                  person.myReaction === reaction
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200"
                }`}
                onClick={() =>
                  react.mutate({
                    profileID: person.profileID,
                    reaction: person.myReaction === reaction ? null : reaction,
                  })
                }
              >
                {reaction} {person.reactions[reaction] ?? 0}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

const CirclesContent = () => {
  const { isSignedIn } = useAuth();
  const { data: profile } = useFetchProfile();
  const { data: people = [], isPending } = useSocialDirectory();
  const activeSchedule = useAppSelector(selectActiveUserSchedule);
  const publish = usePublishSocialSchedule();
  const [published, setPublished] = useState<PublishedSchedule | null>(null);
  const [studyPartnersOnly, setStudyPartnersOnly] = useState(false);
  const [similarInterestsOnly, setSimilarInterestsOnly] = useState(false);

  const ownCourses = useMemo(
    () =>
      new Set([
        ...(profile?.courses
          .filter((course) => course.status === "IN_PROGRESS")
          .map((course) => course.courseID) ?? []),
        ...(profile?.plannedCourses.map((course) => course.courseID) ?? []),
      ]),
    [profile]
  );
  const ownInterests = useMemo(
    () =>
      new Set([
        ...(profile?.careers ?? []),
        ...(profile?.skillsHave ?? []),
        ...(profile?.skillsWant ?? []),
      ]),
    [profile]
  );
  const visiblePeople = people.filter((person) => {
    const personCourses = [
      ...person.currentCourseIDs,
      ...(person.plannedSchedule?.courses.map((course) => course.courseID) ??
        []),
    ];
    const isStudyPartner = personCourses.some((course) =>
      ownCourses.has(course)
    );
    const hasSimilarInterest = [...person.careers, ...person.skills].some(
      (interest) => ownInterests.has(interest)
    );
    return (
      (!studyPartnersOnly || isStudyPartner) &&
      (!similarInterestsOnly || hasSimilarInterest)
    );
  });
  const friendCourses = [
    ...new Set(
      people
        .filter((person) => person.following)
        .flatMap((person) => [
          ...person.currentCourseIDs,
          ...(person.plannedSchedule?.courses.map(
            (course) => course.courseID
          ) ?? []),
        ])
        .filter((course) => !ownCourses.has(course))
    ),
  ];

  if (!isSignedIn) {
    return (
      <div className="mt-8 text-center text-gray-400">
        <SignInButton /> to use Scotty Circles.
      </div>
    );
  }

  const selectedForPublish = toPublishedSchedule(activeSchedule);

  return (
    <div className="m-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-gray-700 text-lg">Scotty Circles</h1>
        <p className="text-gray-400 text-sm">
          Connect around courses, plans, and shared interests.
        </p>
      </div>

      <Card>
        <Card.Header>Share schedules</Card.Header>
        <p className="mt-1 text-gray-500 text-sm">
          Publish the active planned schedule, or make Courses public on your
          Profile to share courses currently in progress.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BUTTON_CLASS}
            disabled={!selectedForPublish || publish.isPending}
            onClick={() => {
              if (!selectedForPublish) return;
              publish.mutate(
                { schedule: selectedForPublish },
                { onSuccess: () => setPublished(selectedForPublish) }
              );
            }}
          >
            Publish active planned schedule
          </button>
          {(published || !isPending) && (
            <button
              type="button"
              className="rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-600"
              onClick={() =>
                publish.mutate(
                  { schedule: null },
                  { onSuccess: () => setPublished(null) }
                )
              }
            >
              Unpublish
            </button>
          )}
          <Link href="/profile#courses">Manage actual schedule sharing</Link>
        </div>
      </Card>

      {friendCourses.length > 0 && (
        <Card>
          <Card.Header>Courses discovered through connections</Card.Header>
          <div className="mt-2 flex flex-wrap gap-x-3 text-sm">
            {friendCourses.map((courseID) => (
              <Link key={courseID} href={`/course/${courseID}`}>
                {courseID}
              </Link>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-gray-700 text-lg">People</h2>
        <div className="flex flex-wrap gap-4">
          <label className="text-gray-500 text-sm">
            <input
              type="checkbox"
              className="mr-2"
              checked={studyPartnersOnly}
              onChange={(event) => setStudyPartnersOnly(event.target.checked)}
            />
            Study partners in my courses
          </label>
          <label className="text-gray-500 text-sm">
            <input
              type="checkbox"
              className="mr-2"
              checked={similarInterestsOnly}
              onChange={(event) =>
                setSimilarInterestsOnly(event.target.checked)
              }
            />
            Similar interests
          </label>
        </div>
      </div>
      {isPending ? (
        <div className="text-gray-400">Loading people…</div>
      ) : visiblePeople.length === 0 ? (
        <div className="text-gray-400 text-sm">
          No matching public profiles yet. Profiles appear here after another
          student makes at least one profile section public.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visiblePeople.map((person) => (
            <ProfileCard
              key={person.profileID}
              person={person}
              ownCourses={ownCourses}
              ownInterests={ownInterests}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CirclesPage: NextPage = () => (
  <Page
    activePage="circles"
    title="Scotty Circles - CMU Courses"
    content={<CirclesContent />}
  />
);

export default CirclesPage;
