import React, { FunctionComponent } from "react";
import { BookmarkIcon as OutlineBookmark } from "@heroicons/react/outline";
import { BookmarkIcon as SolidBookmark } from "@heroicons/react/solid";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { userSlice } from "../app/user";

interface Props {
  courseID: string;
}

const BookmarkButton: FunctionComponent<Props> = ({ courseID }) => {
  const dispatch = useDispatch();
  const bookmarks = useSelector(
    (state: RootStateOrAny) => state.user.bookmarked,
  );
  const bookmarked = bookmarks.indexOf(courseID) !== -1;

  const bookmarkCourse = () => {
    if (bookmarked)
      dispatch(userSlice.actions.removeBookmark(courseID));
    else
      dispatch(userSlice.actions.addBookmark(courseID));
  };

  return (
    <div onClick={bookmarkCourse} className="cursor-pointer">
      {bookmarked ? (
        <SolidBookmark className="w-6 h-6" />
      ) : (
        <OutlineBookmark className="w-6 h-6" />
      )}
    </div>
  );
};

export default BookmarkButton;
