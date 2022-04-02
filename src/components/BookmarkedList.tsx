import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import CourseCard from "./CourseCard";
import { fetchBookmarkedCourseInfos, fetchFCEInfos } from "../app/courses";
import Loading from "./Loading";

const BookmarkedList = () => {
  const loggedIn = useAppSelector((state) => state.user.loggedIn);
  const bookmarked = useAppSelector((state) => state.user.bookmarked);
  const loading = useAppSelector((state) => state.courses.coursesLoading);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (bookmarked) {
      dispatch(fetchBookmarkedCourseInfos(bookmarked));
      if (loggedIn) dispatch(fetchFCEInfos({ courseIDs: bookmarked }));
    }
  }, [bookmarked]);

  const bookmarkedResults = useAppSelector((state) => state.courses.bookmarkedResults);

  return (
    <div className="p-6">
      {loading ? <Loading /> : (
        bookmarkedResults && bookmarkedResults.length > 0 ? (
          <div className="space-y-4">
            {bookmarkedResults.map((course) => (
              <CourseCard info={course} key={course.courseID} showFCEs={true} />
            ))}
          </div>
        ) : (<div>Nothing bookmarked yet!</div>))}
    </div>
  );
};

export default BookmarkedList;
