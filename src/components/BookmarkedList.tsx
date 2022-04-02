import React, { useEffect } from "react";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import CourseCard from "./CourseCard";
import { fetchBookmarkedCourseInfos, fetchFCEInfos } from "../app/courses";
import Loading from "./Loading";

const BookmarkedList = () => {
  const loggedIn = useSelector(
    (state: RootStateOrAny) => state.user.loggedIn,
  );
  const bookmarked = useSelector(
    (state: RootStateOrAny) => state.user.bookmarked,
  );
  const loading = useSelector((state: RootStateOrAny) => state.courses.coursesLoading);
  const dispatch = useDispatch();

  useEffect(() => {
    if (bookmarked) {
      dispatch(fetchBookmarkedCourseInfos(bookmarked));
      if (loggedIn) dispatch(fetchFCEInfos({ courseIDs: bookmarked }));
    }
  }, [bookmarked]);

  const bookmarkedResults = useSelector(
    (state: RootStateOrAny) => state.courses.bookmarkedResults,
  );

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
