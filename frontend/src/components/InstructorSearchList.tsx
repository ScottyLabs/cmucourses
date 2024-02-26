import { useAppDispatch, useAppSelector } from "../app/hooks";
import Loading from "./Loading";
import { Pagination } from "./Pagination";
import React, { useEffect } from "react";
import InstructorDetail from "./InstructorDetail";
import { fetchAllInstructors } from "../app/api/instructors";
import { selectInstructors, cacheSlice } from "../app/cache";

const RESULTS_PER_PAGE = 10;

const InstructorSearchList = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(fetchAllInstructors());
  }, [dispatch]);

  const search = useAppSelector((state) => state.instructors.search);
  const results = useAppSelector(selectInstructors(search));
  const pages = Math.ceil(results.length / RESULTS_PER_PAGE);
  const curPage = useAppSelector((state) => state.cache.instructorPage);
  const loading = useAppSelector((state) => state.cache.instructorsLoading);

  const handlePageClick = (page: number) => {
    dispatch(cacheSlice.actions.setInstructorPage(page + 1));
  };

  return (
    <div className="p-6">
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="space-y-4">
            {results &&
              results
                .slice(curPage * RESULTS_PER_PAGE - RESULTS_PER_PAGE, curPage * RESULTS_PER_PAGE)
                .map((instructor) => (
                  <InstructorDetail name={instructor.name} key={instructor.name} showLoading={false}/>
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
