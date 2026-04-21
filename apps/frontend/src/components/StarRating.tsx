import { useAppSelector } from "~/app/hooks";
import React from "react";
import { styled } from '@mui/material/styles';
import { Rating } from '@mui/material';
import tailwindConfig from "../../tailwind.config.ts";

const StyledRating = styled(Rating)(({ darkMode }: { darkMode: boolean }) => ({
  '& .MuiRating-iconFilled': {
    color: darkMode ? tailwindConfig.theme.colors.gray[50] : tailwindConfig.theme.colors.gray[400],
  },
  '& .MuiRating-iconHover': {
    color: darkMode ? tailwindConfig.theme.colors.gray[100] : tailwindConfig.theme.colors.gray[50],
  },
}));

export const StarRating = ({ rating }: { rating: number }) => {
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  return (
    <>
      <StyledRating
        value={rating}
        readOnly
        precision={0.1}
        darkMode={darkMode}
      />
    </>
  );
};
