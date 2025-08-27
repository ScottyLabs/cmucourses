import { useAppSelector } from "~/app/hooks";
import React from "react";
import StarRatings from "react-star-ratings";
import tailwindConfig from "../../tailwind.config.ts";

export const StarRating = ({ rating }: { rating: number }) => {
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  return (
    <StarRatings
      rating={rating}
      starDimension="20px"
      starSpacing="1px"
      starRatedColor={darkMode ? tailwindConfig.theme.colors.zinc[50] : tailwindConfig.theme.colors.gray[500]}
      starEmptyColor={darkMode ? tailwindConfig.theme.colors.zinc[500] : tailwindConfig.theme.colors.gray[50]}
    />
  );
};
