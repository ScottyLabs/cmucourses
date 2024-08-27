import { useAppSelector } from "~/app/hooks";
import React from "react";
import StarRatings from "react-star-ratings";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config.js";

/* eslint-disable-next-line */
const fullConfig: any = resolveConfig(tailwindConfig);

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
          ? fullConfig.theme.colors.zinc[50]
          : fullConfig.theme.colors.gray[500]
      }
      starEmptyColor={
        darkMode
          ? fullConfig.theme.colors.zinc[500]
          : fullConfig.theme.colors.gray[200]
      }
    />
  );
  /* eslint-enable */
};
