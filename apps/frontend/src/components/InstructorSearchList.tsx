import { useAppDispatch, useAppSelector } from "~/app/hooks";
import Loading from "./Loading";
import { Pagination } from "./Pagination";
import React, { useEffect, useState } from "react";
import InstructorDetail from "./InstructorDetail";
import { fetchAllInstructors } from "~/app/api/instructors";
import { instructorsSlice } from "~/app/instructors";
import { userSlice } from "~/app/user";
import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "~/app/constants";

const RESULTS_PER_PAGE = 10;

const InstructorSearchList = () => {
  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.instructors.search);
  const [results, setResults] = useState<{ instructor: string }[]>([]);

  const { isPending, data: { allInstructors, fuse } = {} } = useQuery({
    queryKey: ['instructors'],
    queryFn: fetchAllInstructors,
    staleTime: STALE_TIME,
  });

  useEffect(() => {
    if (!fuse || !allInstructors) return;

    if (!search) {
      setResults(allInstructors);
      dispatch(instructorsSlice.actions.setNumResults(allInstructors.length));
    } else {
      const searchResults = fuse.search(search).map(({item}) => item);
      setResults(searchResults);
      console.log(searchResults)
      dispatch(instructorsSlice.actions.setNumResults(searchResults.length));
    }
  }, [fuse, search]);

  const pages = Math.ceil(results.length / RESULTS_PER_PAGE);
  const curPage = useAppSelector((state) => state.instructors.instructorPage);
  const loading = useAppSelector((state) => state.instructors.instructorsLoading);

  dispatch(userSlice.actions.resetFilters()); // Not ideal

  const handlePageClick = (page: number) => {
    dispatch(instructorsSlice.actions.setInstructorPage(page + 1));
  };

  return (
    <div className="p-6">
      {loading || isPending ? (
        <Loading />
      ) : (
        <>
          <div className="space-y-4">
            {results &&
              results
                .slice(
                  curPage * RESULTS_PER_PAGE - RESULTS_PER_PAGE,
                  curPage * RESULTS_PER_PAGE
                )
                .map((instructor) => (
                  <InstructorDetail
                    name={instructor.instructor}
                    key={instructor.instructor}
                    showLoading={false}
                  />
                ))}
          </div>
          <div className="mx-auto my-6">
            <Pagination
              currentPage={curPage - 1}
              setCurrentPage={handlePageClick}
              totalPages={pages}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default InstructorSearchList;
