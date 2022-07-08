import React from "react";
import { StarIcon as OutlineStar } from "@heroicons/react/outline";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { userSlice } from "../app/user";

interface Props {
  courseID: string;
}

const BookmarkButton = ({ courseID }: Props) => {
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector((state) => state.user.bookmarked);
  const bookmarked = bookmarks.indexOf(courseID) !== -1;

  const bookmarkCourse = () => {
    if (bookmarked) dispatch(userSlice.actions.removeBookmark(courseID));
    else dispatch(userSlice.actions.addBookmark(courseID));
  };

  return (
    <div onClick={bookmarkCourse} className="cursor-pointer">
      {bookmarked ? (
        <OutlineStar className="h-6 w-6 fill-yellow-500 stroke-yellow-500 dark:stroke-yellow-500" />
      ) : (
        <OutlineStar className="h-6 w-6 fill-transparent stroke-gray-700 dark:stroke-zinc-600" />
      )}
    </div>
  );
};

export default BookmarkButton;
