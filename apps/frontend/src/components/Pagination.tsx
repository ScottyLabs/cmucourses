import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Pagination as HeadlessPagination } from "react-headless-pagination";

export const Pagination = ({
  currentPage,
  setCurrentPage,
  totalPages,
}: {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
}) => {
  return (
    <HeadlessPagination
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      totalPages={totalPages}
      className="text-gray-600 flex w-full justify-center"
    >
      <HeadlessPagination.PrevButton className="">
        <ChevronLeftIcon className="h-5 w-5 " />
      </HeadlessPagination.PrevButton>

      <div className="flex items-center align-baseline">
        <HeadlessPagination.PageButton
          activeClassName="bg-gray-300"
          inactiveClassName=""
          className="mx-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-white"
        />
      </div>

      <HeadlessPagination.NextButton>
        <ChevronRightIcon className="h-5 w-5 " />
      </HeadlessPagination.NextButton>
    </HeadlessPagination>
  );
};
