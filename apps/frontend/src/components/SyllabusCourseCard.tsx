import React from "react";
import { useFetchCourseInfo } from "~/app/api/course";
import { standardizeId, getCanvasLinkFromDownloadLink, groupSyllabiByNumber, sortSyllabi } from "~/app/utils";
import { Card } from "./Card";
import Link from "next/link";
import { Syllabus } from "~/app/types";
import {
 ColumnDef,
 getCoreRowModel,
 useReactTable,
} from "@tanstack/react-table";
import { getTable } from "~/components/GetTable";

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

export const SyllabusCourseCard = ({ number, syllabi }: { number: string; syllabi: Syllabus[] }) => {
    const sortedSyllabi = sortSyllabi(syllabi);
    const tableData = convertSyllabiToTableData(sortedSyllabi, number);
    
    const formattedCourseNumber = standardizeId(number);
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