import React, { FunctionComponent } from "react";
import { StarIcon as OutlineStar } from "@heroicons/react/outline";
import { StarIcon as SolidStar } from "@heroicons/react/solid";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { userSlice } from "../app/user";

interface Props {
  courseID: string;
}

const BookmarkButton: FunctionComponent<Props> = ({ courseID }) => {
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector((state) => state.user.bookmarked);
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
        <SolidStar className="w-6 h-6 " />
      ) : (
        <OutlineStar className="w-6 h-6" />
      )}
    </div>
  );
};

export default BookmarkButton;
