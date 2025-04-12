import React, { useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { useFetchAllSyllabi } from "~/app/api/syllabi";
import Loading from "./Loading";
import { Pagination } from "./Pagination";
import { filtersSlice } from "~/app/filters";
import { useRouter } from "next/router";
import { SyllabiPage, ITEMS_PER_PAGE } from "~/components/SyllabiDetail";

const SyllabiSearchList: React.FC = () => {
 const router = useRouter();
 const dispatch = useAppDispatch();
 const curPage = useAppSelector((state) => state.filters.page);
 const { isPending, data: syllabi } = useFetchAllSyllabi();
  const { course: courseQuery } = router.query;
 const courseFilter = typeof courseQuery === 'string' ? courseQuery.trim().toLowerCase() : null;
  const totalCourses = useMemo(() => {
   if (!syllabi) return 0;
  
   if (courseFilter) {
     const hasCourse = syllabi.some(s =>
       (s.number || "").trim().toLowerCase() === courseFilter
     );
     return hasCourse ? 1 : 0;
   }
  
   const uniqueCourses = new Set(
     syllabi.map(s => (s.number || "").trim().toLowerCase())
   );
   return uniqueCourses.size;
 }, [syllabi, courseFilter]);
  const totalPages = useMemo(() => {
   if (courseFilter) return 1;
   return Math.ceil(totalCourses / ITEMS_PER_PAGE);
 }, [totalCourses, courseFilter]);

 const handlePageClick = (page: number) => {
   void dispatch(filtersSlice.actions.setPage(page + 1));
 };

 return (
   <div className="h-full">
     {isPending ? (
       <Loading />
     ) : (
       <>
         <SyllabiPage />
         {totalPages > 1 && !courseFilter && (
           <div className="px-6 my-6">
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