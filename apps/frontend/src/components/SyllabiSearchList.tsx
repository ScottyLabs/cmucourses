import React, { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { useFetchAllSyllabi } from "~/app/api/syllabi";
import Loading from "./Loading";
import { Pagination } from "./Pagination";
import { filtersSlice } from "~/app/filters";
import { Card } from "./Card";
import Link from "next/link";

const ITEMS_PER_PAGE = 20; 

const SyllabiPage = () => {
  const page = useAppSelector((state) => state.filters.page);
  const { data: syllabi } = useFetchAllSyllabi();
  
  const syllabiToShow = useMemo(() => {
    if (!syllabi || syllabi.length === 0) return [];
    
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    return syllabi.slice(startIndex, endIndex);
  }, [syllabi, page]);

  if (!syllabi || syllabi.length === 0) {
    return (
      <div className="p-4 bg-yellow-100 rounded">
        <p className="font-bold">No syllabi found!</p>
        <p>The API returned no syllabi data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {syllabiToShow.map((syllabus, index) => (
        <Card key={index}>
          <div className="p-4">
            <div className="grid grid-cols-8 gap-x-6 gap-y-2">
              <div className="col-span-5 col-start-1 row-span-1 row-start-1 md:col-span-6">
                <div className="text-lg text-gray-800">
                  <span className="mr-2 inline-block whitespace-nowrap font-semibold">
                    {syllabus.number}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {syllabus.season} {syllabus.year}
                </div>
              </div>
              
              <div className="col-span-3 col-start-6 md:col-span-2">
                <div className="flex justify-end">
                  <a 
                    href={syllabus.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-slate-500 underline"
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

const SyllabiSearchList: React.FC = () => {
  const curPage = useAppSelector((state) => state.filters.page);
  const { isPending, data: syllabi } = useFetchAllSyllabi();
  
  const dispatch = useAppDispatch();
  
  const totalPages = useMemo(() => {
    if (!syllabi) return 0;
    return Math.ceil(syllabi.length / ITEMS_PER_PAGE);
  }, [syllabi]);

  const handlePageClick = (page: number) => {
    void dispatch(filtersSlice.actions.setPage(page + 1));
  };

  return (
    <div className="p-6">
      {isPending ? (
        <Loading />
      ) : (
        <>
          <SyllabiPage />
          {totalPages > 1 && (
            <div className="mx-auto my-6">
              <Pagination
                currentPage={curPage - 1}
                setCurrentPage={handlePageClick}
                totalPages={totalPages}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SyllabiSearchList;