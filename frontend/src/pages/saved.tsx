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
      activePage="saved"
      sidebar={<Aggregate />}
      content={
        <div>
          <div className="text-black-400 mt-5 text-center">
              Number of saved courses: {saved.length}
          </div>
          <CourseList courseIDs={saved}>
          <div className="text-gray-400 mt-4 text-center">
            Nothing saved yet!
          </div>
        </CourseList>
        </div>
      }
    />
  );
};

export default SavedPage;
