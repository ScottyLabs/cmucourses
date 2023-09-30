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
        <h1 style={{marginLeft: "30px", marginTop: "20px", color: "green"}}>number of saved courses: {saved.length}</h1>
        <CourseList courseIDs={saved}>
          <div className="text-gray-400 mt-6 text-center">
            Nothing saved yet!
          </div>
        </CourseList>
        </div>
      }
    />
  );
};

export default SavedPage;
