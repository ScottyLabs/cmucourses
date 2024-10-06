import { useAppSelector } from "~/app/hooks";
import React from "react";
import StarRatings from "react-star-ratings";

export const StarRating = ({ rating }: { rating: number }) => {
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  /* eslint-disable */
  return (
    <StarRatings
      rating={rating}
      starDimension="20px"
      starSpacing="1px"
      starRatedColor={
        darkMode
            ? 'zinc-300'
            : 'gray-500'
      }
      starEmptyColor={
        darkMode
        ? 'zinc-300'
        : 'gray-300'
      }
    />
  );
  /* eslint-enable */
};
