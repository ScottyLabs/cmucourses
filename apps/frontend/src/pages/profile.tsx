import type { NextPage } from "next";
import React from "react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { Profile } from "@cmucourses/profile";
import { Page } from "~/components/Page";
import Loading from "~/components/Loading";
import { useFetchProfile } from "~/app/api/profile";
import { PublicInfoSection } from "~/components/profile/PublicInfoSection";
import { AcademicSection } from "~/components/profile/AcademicSection";
import { CareersSection } from "~/components/profile/CareersSection";
import { SkillsSection } from "~/components/profile/SkillsSection";
import { WorkloadSection } from "~/components/profile/WorkloadSection";
import { TimeSection } from "~/components/profile/TimeSection";
import { CoursesSection } from "~/components/profile/CoursesSection";
import { PlanSection } from "~/components/profile/PlanSection";
import { PROFILE_SECTIONS } from "~/components/profile/completeness";
import { PRIMARY_BUTTON_CLASS } from "~/components/profile/fields";

const Completeness = ({ profile }: { profile: Profile }) => {
  const missing = PROFILE_SECTIONS.filter(
    (section) => !section.isComplete(profile)
  );
  const done = PROFILE_SECTIONS.length - missing.length;

  return (
    <div className="text-gray-500 text-sm">
      {done} of {PROFILE_SECTIONS.length} sections complete.
      {missing.length > 0 && (
        <>
          {" "}
          Missing:{" "}
          {missing.map((section, index) => (
            <React.Fragment key={section.id}>
              {index > 0 && ", "}
              <a
                href={`#${section.id}`}
                className="text-blue-600 hover:underline"
              >
                {section.title}
              </a>
            </React.Fragment>
          ))}
        </>
      )}
    </div>
  );
};

const ProfileContent = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { data: profile, isError, refetch } = useFetchProfile();

  if (!isLoaded) return <Loading />;

  if (!isSignedIn) {
    return (
      <div className="mt-6 text-center text-gray-400">
        <p>
          Sign in to set up your profile. It keeps your goals and preferences
          across devices.
        </p>
        <div className="mt-4 inline-flex">
          <div className={PRIMARY_BUTTON_CLASS}>
            <SignInButton />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-6 text-center text-gray-400">
        <p>We couldn&apos;t load your profile.</p>
        <p className="mt-1 text-xs">
          If this sits then fails, Atlas is likely blocking this network. Add
          your IP (or 0.0.0.0/0 for a dev cluster) under Network Access.
        </p>
        <button
          type="button"
          className="mt-2 text-blue-600 hover:underline"
          onClick={() => void refetch()}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!profile) return <Loading />;

  return (
    <div className="m-auto max-w-4xl space-y-4 p-6">
      <div>
        <h1 className="text-gray-700 text-lg">Your Profile</h1>
        <Completeness profile={profile} />
      </div>
      <PublicInfoSection profile={profile} />
      <AcademicSection profile={profile} />
      <CareersSection profile={profile} />
      <SkillsSection profile={profile} />
      <WorkloadSection profile={profile} />
      <TimeSection profile={profile} />
      <CoursesSection profile={profile} />
      <PlanSection profile={profile} />
    </div>
  );
};

const ProfilePage: NextPage = () => {
  return (
    <Page
      activePage="profile"
      title="Profile - CMU Courses"
      content={<ProfileContent />}
    />
  );
};

export default ProfilePage;
