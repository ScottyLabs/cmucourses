import React, { useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { useFetchAllSyllabi } from "~/app/api/syllabi";
import { useFetchCourseInfo } from "~/app/api/course";
import Loading from "./Loading";
import { Pagination } from "./Pagination";
import { filtersSlice } from "~/app/filters";
import { Card } from "./Card";
import Link from "next/link";
import { useRouter } from "next/router";
import { Syllabus } from "~/app/types";
import {
 ColumnDef,
 getCoreRowModel,
 useReactTable,
} from "@tanstack/react-table";
import { getTable } from "~/components/GetTable";


const ITEMS_PER_PAGE = 20;


// Helper function to format course number with dash (15150 -> 15-150)
const formatCourseNumberWithDash = (number: string): string => {
 if (number && number.length >= 5) {
   return `${number.substring(0, 2)}-${number.substring(2)}`;
 }
 return number;
};


// Helper function to convert download link to canvas link
const getCanvasLinkFromDownloadLink = (downloadLink: string): string => {
 if (!downloadLink || downloadLink === "#") return "#";
  try {
   // Extract the file ID and verifier from the download link
   const fileIdMatch = downloadLink.match(/\/files\/(\d+)/);
   const verifierMatch = downloadLink.match(/verifier=([^&]+)/);
  
   if (fileIdMatch && verifierMatch) {
     const fileId = fileIdMatch[1];
     const verifier = verifierMatch[1];
    
     // Construct the canvas link
     return `https://canvas.cmu.edu/files/${fileId}/?verifier=${verifier}`;
   }
  
   // If we can't parse the link, return the original
   return downloadLink;
 } catch (e) {
   console.error("Error parsing download link:", e);
   return downloadLink;
 }
};


// Group syllabi by course number
const groupSyllabiByNumber = (syllabi: Syllabus[]) => {
 return syllabi.reduce((groups, syllabus) => {
   const num = syllabus.number?.trim().toLowerCase() || '';
   if (!groups[num]) groups[num] = [];
   groups[num].push(syllabus);
   return groups;
 }, {} as Record<string, Syllabus[]>);
};


// Sort syllabi by year and season
const sortSyllabi = (syllabi: Syllabus[]) => {
 return [...syllabi].sort((a, b) => {
   if (a.year !== b.year) return b.year - a.year;
   const seasonOrder: Record<string, number> = { "spring": 1, "fall": 0 };
   return (seasonOrder[b.season.toLowerCase()] || 0) - (seasonOrder[a.season.toLowerCase()] || 0);
 });
};


// Define type for rows in our syllabus table
type SyllabusRow = {
 semester: string;
 section: string;
 canvasLink: {
   url: string;
   text: string;
 };
 downloadLink: {
   url: string;
   text: string;
 };
};


// Define column configurations for syllabus table
const syllabusColumns: ColumnDef<SyllabusRow>[] = [
 {
   header: "Semester",
   accessorKey: "semester",
 },
 {
   header: "Section",
   accessorKey: "section",
 },
 {
   header: "View Syllabus on Canvas",
   accessorKey: "canvasLink",
   cell: (info) => {
     const link = info.getValue() as { url: string; text: string };
     return (
       <a
         href={link.url}
         className="text-blue-600 hover:underline"
         target="_blank"
         rel="noopener noreferrer"
       >
         {link.text}
       </a>
     );
   },
 },
 {
   header: "Download",
   accessorKey: "downloadLink",
   cell: (info) => {
     const link = info.getValue() as { url: string; text: string };
     return (
       <a
         href={link.url}
         className="text-blue-600 hover:underline"
         target="_blank"
         rel="noopener noreferrer"
       >
         {link.text}
       </a>
     );
   },
 },
];


const SyllabusDataTable = ({ data }: { data: SyllabusRow[] }) => {
 const table = useReactTable({
   columns: syllabusColumns,
   data,
   getCoreRowModel: getCoreRowModel(),
 });


 return getTable(table);
};


// Convert syllabi to table data format
const convertSyllabiToTableData = (syllabi: Syllabus[], courseNumber: string): SyllabusRow[] => {
 return syllabi.map(syllabus => {
   const courseCode = courseNumber.toUpperCase();
   const seasonPrefix = syllabus.season.toLowerCase().startsWith('f') ? 'F' : 'S';
   const yearCode = syllabus.year.toString().slice(-2);
   const displayCode = `${seasonPrefix}${yearCode}-${courseCode}-${syllabus.section || "1"}`;
  
   const downloadLink = syllabus.url || "#";
   const canvasLink = getCanvasLinkFromDownloadLink(downloadLink);
  
   return {
     semester: `${syllabus.season} ${syllabus.year}`,
     section: syllabus.section || "1",
     canvasLink: {
       url: canvasLink,
       text: `${displayCode} (Canvas Link)`
     },
     downloadLink: {
       url: downloadLink,
       text: `${displayCode} (Download Link)`
     }
   };
 });
};


// Component for a single course's syllabi card
const SyllabusCourseCard = ({ number, syllabi }: { number: string; syllabi: Syllabus[] }) => {
 const sortedSyllabi = sortSyllabi(syllabi);
 const tableData = convertSyllabiToTableData(sortedSyllabi, number);
 
 const formattedCourseNumber = formatCourseNumberWithDash(number);
 const { data: courseInfo } = useFetchCourseInfo(formattedCourseNumber);
 
 const courseName = courseInfo?.name || syllabi[0]?.name || "";
 
 return (
   <Card>
     <Card.Header>
       <Link href={`/course/${formattedCourseNumber}`} className="text-blue-600 hover:underline">
         {formattedCourseNumber}: {courseName}
       </Link>
     </Card.Header>
     <div className="overflow-x-auto bg-gray-50 p-4">
       <SyllabusDataTable data={tableData} />
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
         <h2 className="text-lg font-medium text-gray-700">Syllabi for {formatCourseNumberWithDash(courseFilter)}</h2>
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

