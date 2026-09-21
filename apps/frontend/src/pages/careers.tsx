import type { NextPage } from "next";
import React from "react";
import { useAuth } from "@clerk/nextjs";
import {
  allCareerProgress,
  careerProgress,
  CareerProgress,
  labelOf,
  SKILLS,
} from "@cmucourses/profile";
import { Page } from "~/components/Page";
import Loading from "~/components/Loading";
import Link from "~/components/Link";
import { Card } from "~/components/Card";
import { Pill, TagRow } from "~/components/CourseTags";
import ProgressBar from "~/components/ProgressBar";
import { useFetchProfile, useHasProfileGoals } from "~/app/api/profile";

const MAX_SUGGESTED_COURSES = 3;

const SuggestedCourses = ({ courseIDs }: { courseIDs: readonly string[] }) => {
  if (courseIDs.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-gray-500">
      {courseIDs.slice(0, MAX_SUGGESTED_COURSES).map((courseID) => (
        <Link key={courseID} href={`/course/${courseID}`}>
          {courseID}
        </Link>
      ))}
    </div>
  );
};

const CareerProgressCard = ({ progress }: { progress: CareerProgress }) => (
  <Card>
    <Card.Header>{progress.label}</Card.Header>
    <div className="mt-2">
      <ProgressBar
        value={progress.coreCovered}
        max={progress.coreTotal}
        label={`${progress.coreCovered} / ${progress.coreTotal} core skills`}
      />
    </div>
    {progress.covered.length > 0 && (
      <div className="mt-3">
        <div className="mb-1 text-gray-500 text-xs">Covered</div>
        <div className="flex flex-wrap gap-1">
          {progress.covered.map((skill) => (
            <Pill key={skill} highlighted={false}>
              {labelOf(SKILLS, skill)}
            </Pill>
          ))}
        </div>
      </div>
    )}
    {progress.gaps.length > 0 && (
      <div className="mt-3">
        <div className="mb-1 text-gray-500 text-xs">Still missing</div>
        <div className="space-y-2">
          {progress.gaps.map((gap) => (
            <div key={gap.skill}>
              <Pill highlighted>{gap.label}</Pill>
              <SuggestedCourses courseIDs={gap.courseIDs} />
            </div>
          ))}
        </div>
      </div>
    )}
  </Card>
);

const YourProgress = () => {
  const { isSignedIn } = useAuth();
  const hasGoals = useHasProfileGoals();
  const { data: profile } = useFetchProfile();

  if (!isSignedIn || !hasGoals || !profile) {
    return (
      <div className="mt-2 text-gray-400 text-sm">
        <Link href="/profile">Add career goals on your Profile</Link> to see
        your progress toward them here.
      </div>
    );
  }

  const progress = careerProgress({
    careers: profile.careers,
    skillsHave: profile.skillsHave,
    takenCourseIDs: profile.courses.map((course) => course.courseID),
  });

  if (progress.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {progress.map((p) => (
        <CareerProgressCard key={p.career} progress={p} />
      ))}
    </div>
  );
};

const AllCareersCard = ({
  progress,
  goalCareers,
}: {
  progress: CareerProgress;
  goalCareers: ReadonlySet<string>;
}) => {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <Card.Header>{progress.label}</Card.Header>
        {goalCareers.has(progress.career) && (
          <span className="text-blue-600 text-xs">Your goal</span>
        )}
      </div>
      <div className="mt-2">
        <TagRow
          ids={[...progress.covered, ...progress.gaps.map((g) => g.skill)]}
          labels={SKILLS}
          highlightIDs={new Set(progress.covered)}
          max={8}
        />
      </div>
    </Card>
  );
};

const AllCareerPaths = () => {
  const { data: profile } = useFetchProfile();
  const skillsHave = profile?.skillsHave ?? [];
  const takenCourseIDs = profile?.courses.map((c) => c.courseID) ?? [];
  const goalCareers = new Set(profile?.careers ?? []);

  const progress = allCareerProgress(skillsHave, takenCourseIDs);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {progress.map((p) => (
        <AllCareersCard key={p.career} progress={p} goalCareers={goalCareers} />
      ))}
    </div>
  );
};

const AlternativeAcademicPaths = () => {
  const { data: profile } = useFetchProfile();
  if (!profile || profile.careers.length === 0) return null;

  const progress = careerProgress({
    careers: profile.careers,
    skillsHave: profile.skillsHave,
    takenCourseIDs: [
      ...profile.courses.map((course) => course.courseID),
      ...profile.plannedCourses.map((course) => course.courseID),
    ],
  });
  const paths = [0, 1, 2]
    .map((optionIndex) => [
      ...new Set(
        progress.flatMap((career) =>
          career.gaps.flatMap((gap) => gap.courseIDs[optionIndex] ?? [])
        )
      ),
    ])
    .filter((path) => path.length > 0);

  if (paths.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {paths.map((path, index) => (
        <Card key={index}>
          <Card.Header>Path {index + 1}</Card.Header>
          <p className="mt-1 text-gray-400 text-xs">
            An alternative set of courses covering current career-skill gaps.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-2 text-sm">
            {path.map((courseID) => (
              <Link key={courseID} href={`/course/${courseID}`}>
                {courseID}
              </Link>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

const CareersContent = () => {
  const { isLoaded } = useAuth();
  if (!isLoaded) return <Loading />;

  return (
    <div className="m-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-gray-700 text-lg">Your progress</h1>
        <div className="mt-3">
          <YourProgress />
        </div>
      </div>
      <div>
        <h1 className="text-gray-700 text-lg">All career paths</h1>
        <p className="text-gray-400 text-sm">
          What each career path draws on, and how your current skills line up.
        </p>
        <div className="mt-3">
          <AllCareerPaths />
        </div>
      </div>
      <div>
        <h1 className="text-gray-700 text-lg">Alternative academic paths</h1>
        <p className="text-gray-400 text-sm">
          Different course combinations that can close the same career-skill
          gaps.
        </p>
        <div className="mt-3">
          <AlternativeAcademicPaths />
        </div>
      </div>
    </div>
  );
};

const CareersPage: NextPage = () => {
  return (
    <Page
      activePage="careers"
      title="Careers - CMU Courses"
      content={<CareersContent />}
    />
  );
};

export default CareersPage;
