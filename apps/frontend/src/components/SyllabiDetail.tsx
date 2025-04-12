import React, { useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { useFetchAllSyllabi } from "~/app/api/syllabi";
import { standardizeId, getCanvasLinkFromDownloadLink, groupSyllabiByNumber, sortSyllabi } from "~/app/utils";
import { filtersSlice } from "~/app/filters";
import Link from "next/link";
import { useRouter } from "next/router";
import { SyllabusCourseCard } from "~/components/SyllabusCourseCard";

export const ITEMS_PER_PAGE = 20;
   
export const SyllabiPage = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { course: courseQuery } = router.query;
    const courseFilter = typeof courseQuery === 'string' ? courseQuery.trim().toLowerCase() : null;
     const page = useAppSelector((state) => state.filters.page);
    const { data: syllabi } = useFetchAllSyllabi();
     const filteredSyllabi = useMemo(() => {
      if (!syllabi || syllabi.length === 0) return [];
     
      if (courseFilter) {
        return syllabi.filter(s =>
          (s.number || "").trim().toLowerCase() === courseFilter
        );
      }
     
      return syllabi;
    }, [syllabi, courseFilter]);
     const groupedSyllabi = useMemo(() => {
      return groupSyllabiByNumber(filteredSyllabi);
    }, [filteredSyllabi]);
     const courseNumbers = useMemo(() => {
      return Object.keys(groupedSyllabi).sort();
    }, [groupedSyllabi]);
     const pagedCourseNumbers = useMemo(() => {
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
     
      return courseNumbers.slice(startIndex, endIndex);
    }, [courseNumbers, page]);
   
    useEffect(() => {
      if (courseFilter && courseNumbers.length > 0) {
        const courseIndex = courseNumbers.indexOf(courseFilter);
        if (courseIndex >= 0) {
          const correctPage = Math.floor(courseIndex / ITEMS_PER_PAGE) + 1;
          if (page !== correctPage) {
            dispatch(filtersSlice.actions.setPage(correctPage));
          }
        }
      }
    }, [courseFilter, courseNumbers, page, dispatch]);
   
    if (!syllabi || syllabi.length === 0) {
      return (
        <div className="p-4 bg-yellow-100 rounded">
          <p className="font-bold">No syllabi found!</p>
          <p>The API returned no syllabi data.</p>
        </div>
      );
    }
     if (filteredSyllabi.length === 0) {
      return (
        <div className="p-4 bg-yellow-100 rounded">
          <p className="font-bold">No syllabi found for course "{courseFilter}"</p>
          <p>Try searching for a different course number.</p>
          <Link href="/syllabi" className="text-blue-600 hover:underline mt-2 inline-block">
            View all syllabi
          </Link>
        </div>
      );
    }
   
    if (courseFilter) {
      return (
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-700">Syllabi for {standardizeId(courseFilter)}</h2>
            <Link href="/syllabi" className="text-blue-600 hover:underline">
              View all syllabi
            </Link>
          </div>
          <SyllabusCourseCard
            number={courseFilter}
            syllabi={filteredSyllabi}
          />
        </div>
      );
    }
   
    return (
      <div className="p-6 space-y-4">
        {pagedCourseNumbers.map((number) => (
          <SyllabusCourseCard
            key={number}
            number={number}
            syllabi={groupedSyllabi[number]}
          />
        ))}
      </div>
    );
   };