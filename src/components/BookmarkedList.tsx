import React, { useState, useEffect } from "react";
import { useSelector, useDispatch, RootStateOrAny } from "react-redux";
import CourseCard from "./CourseCard";
import { fetchCourseInfos, fetchFCEInfos } from "../app/courses";

const BookmarkedList = () => {
  const loggedIn = useSelector(
    (state: RootStateOrAny) => state.user.loggedIn
  );
  const bookmarked = useSelector(
    (state: RootStateOrAny) => state.user.bookmarked
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (bookmarked) {
      dispatch(fetchCourseInfos(bookmarked));
      if (loggedIn) dispatch(fetchFCEInfos({ courseIDs: bookmarked }));
    }
  }, [bookmarked]);

  const bookmarkedResults = useSelector(
    (state: RootStateOrAny) => state.courses.bookmarkedResults
  );

  return (
    <div className="p-6">
      {bookmarkedResults && bookmarkedResults.length > 0 ? (
        <div className="space-y-4">
          {bookmarkedResults.map((course) => (
            <CourseCard info={course} key={course.courseID} showFCEs={true} />
          ))}
        </div>
      ) : (<div>Nothing bookmarked yet!</div>)}
    </div>
  );
};

export default BookmarkedList;
