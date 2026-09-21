import React from "react";
import { LIMITS, Profile } from "@cmucourses/profile";
import { classNames } from "~/app/utils";
import { Field, INPUT_CLASS } from "./fields";
import { ProfileSection, useDraft } from "./ProfileSection";

export const PublicInfoSection = ({ profile }: { profile: Profile }) => {
  const { draft, setDraft, dirty } = useDraft({
    displayName: profile.displayName ?? "",
    bio: profile.bio ?? "",
  });

  return (
    <ProfileSection
      id="public-info"
      title="Public info"
      description="How you appear in Scotty Circles. Individual profile sections still follow their Public/Private controls."
      profile={profile}
      dirty={dirty}
      patch={draft}
    >
      <Field label="Display name">
        <input
          className={classNames(INPUT_CLASS, "mt-2 w-full sm:w-72")}
          value={draft.displayName}
          maxLength={LIMITS.displayName}
          onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
        />
      </Field>
      <Field label="Bio">
        <textarea
          className={classNames(INPUT_CLASS, "mt-2 w-full")}
          rows={3}
          value={draft.bio}
          maxLength={LIMITS.bio}
          onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
        />
        <div className="text-right text-gray-400">
          {draft.bio.length} / {LIMITS.bio}
        </div>
      </Field>
    </ProfileSection>
  );
};
