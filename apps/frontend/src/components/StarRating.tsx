import React from "react";
import { styled } from '@mui/material/styles';
import { Rating } from '@mui/material';

const StyledRating = styled(Rating)({
  '& .MuiRating-iconFilled': {
    color: "var(--halloween-pumpkin)",
  },
  '& .MuiRating-iconHover': {
    color: "var(--color-blue-800)",
  },
  '& .MuiRating-iconEmpty': {
    color: "var(--color-gray-300)",
  },
});

export const StarRating = ({ rating }: { rating: number }) => {
  return (
    <>
      <StyledRating
        value={rating}
        readOnly
        precision={0.1}
      />
    </>
  );
};
