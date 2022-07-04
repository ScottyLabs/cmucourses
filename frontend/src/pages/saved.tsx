import type { NextPage } from "next";
import React from "react";
import CourseList from "../components/CourseList";
import Aggregate from "../components/Aggregate";
import { useAppSelector } from "../app/hooks";
import { Page } from "../components/Page";

const SavedPage: NextPage = () => {
  const saved = useAppSelector((state) => state.user.bookmarked);

  return (
    <Page
      sidebar={<Aggregate />}
      content={
        <CourseList courseIDs={saved}>
          <div className="text-grey-500 text-center font-semibold">
            Nothing bookmarked yet!
          </div>
        </CourseList>
      }
    />
  );
};

export default SavedPage;
