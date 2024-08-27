import type { NextPage } from "next";
import React from "react";
import CourseList from "~/components/CourseList";
import Aggregate from "~/components/Aggregate";
import { useAppSelector } from "~/app/hooks";
import { Page } from "~/components/Page";

const SavedPage: NextPage = () => {
  const saved = useAppSelector((state) => state.user.bookmarked);

  return (
    <Page
      activePage="saved"
      sidebar={<Aggregate />}
      content={
        <CourseList courseIDs={saved}>
          <div className="mt-6 text-center text-gray-400">
            Nothing saved yet!
          </div>
        </CourseList>
      }
    />
  );
};

export default SavedPage;
