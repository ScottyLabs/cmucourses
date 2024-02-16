import { useAppDispatch, useAppSelector } from "../app/hooks";
import Loading from "./Loading";
import { Pagination } from "./Pagination";
import React, { useEffect } from "react";
import InstructorDetail from "./InstructorDetail";
import { fetchAllProfessors } from "../app/api/professors";
import { selectProfessors, cacheSlice } from "../app/cache";

const RESULTS_PER_PAGE = 5;

const ProfessorSearchList = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(fetchAllProfessors());
  }, []);

  const search = useAppSelector((state) => state.professors.search);
  const results = useAppSelector(selectProfessors(search));
  const pages = Math.ceil(results.length / RESULTS_PER_PAGE);
  const curPage = useAppSelector((state) => state.cache.professorPage);
  const loading = useAppSelector((state) => state.cache.professorsLoading);
  const typing = useAppSelector((state) => state.professors.typing);

  const handlePageClick = (page: number) => {
    dispatch(cacheSlice.actions.setProfessorPage(page + 1));
  };

  return (
    <div className="p-6">
      {loading || typing ? (
        <Loading />
      ) : (
        <>
          <div className="space-y-4">
            {results &&
              results
                .slice(curPage * RESULTS_PER_PAGE - RESULTS_PER_PAGE, curPage * RESULTS_PER_PAGE)
                .map((professor) => (
                  <InstructorDetail name={professor.name} key={professor.name}/>
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

export default ProfessorSearchList;
