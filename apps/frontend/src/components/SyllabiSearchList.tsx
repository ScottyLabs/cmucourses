import React, { useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { useFetchAllSyllabi } from "~/app/api/syllabi";
import Loading from "./Loading";
import { Pagination } from "./Pagination";
import { filtersSlice } from "~/app/filters";
import { Card } from "./Card";
import Link from "next/link";
import { useRouter } from "next/router";
import { Syllabus } from "~/app/types";

const ITEMS_PER_PAGE = 20; 

const groupSyllabiByNumber = (syllabi: Syllabus[]) => {
  return syllabi.reduce((groups, syllabus) => {
    const num = syllabus.number?.trim().toLowerCase() || '';
    if (!groups[num]) groups[num] = [];
    groups[num].push(syllabus);
    return groups;
  }, {} as Record<string, Syllabus[]>);
};

const sortSyllabi = (syllabi: Syllabus[]) => {
  return [...syllabi].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    const seasonOrder = { "spring": 1, "fall": 0 };
    return (seasonOrder[b.season.toLowerCase()] || 0) - (seasonOrder[a.season.toLowerCase()] || 0);
  });
};

const formatCourseNumberWithDash = (number: string): string => {
  if (number && number.length >= 5) {
    return `${number.substring(0, 2)}-${number.substring(2)}`;
  }
  return number;
};

const SyllabusCourseCard = ({ number, syllabi }: { number: string; syllabi: Syllabus[] }) => {
  const sortedSyllabi = sortSyllabi(syllabi);
  
  return (
    <Card>
      <Card.Header>
        <Link href={`/course/${formatCourseNumberWithDash(number)}`} className="text-blue-600 hover:underline">
          {number}
        </Link>
      </Card.Header>
      <div className="p-4">
        {sortedSyllabi.map((syllabus, index) => (
          <a
            key={syllabus.id || index}
            href={syllabus.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline block mb-2"
          >
            {syllabus.season} {syllabus.year} Syllabus
            {syllabus.section ? ` (Section ${syllabus.section})` : ''}
          </a>
        ))}
      </div>
    </Card>
  );
};

const SyllabiPage = () => {
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
  }, [courseFilter, courseNumbers, page]);

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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Syllabi for {courseFilter}</h2>
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
    <div className="space-y-4">
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
    <div className="p-6">
      {isPending ? (
        <Loading />
      ) : (
        <>
          <SyllabiPage />
          {totalPages > 1 && !courseFilter && (
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