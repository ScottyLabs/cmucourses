import React from "react";
import { Card } from "./Card";
import { useFetchSyllabi } from "~/app/api/syllabi";
import { Syllabus } from "~/app/types";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { getTable } from "~/components/GetTable";

interface SyllabusCardProps {
  number: string;
}

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

// Define column configurations
const columns: ColumnDef<SyllabusRow>[] = [
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
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return getTable(table);
};

const SyllabusCard: React.FC<SyllabusCardProps> = ({ number }) => {
  const trimmedNumber = number.trim().toLowerCase();
  const { data: syllabi, isLoading, error } = useFetchSyllabi([trimmedNumber]);

  const courseSyllabi = !syllabi ? [] : syllabi.filter((syllabus: Syllabus) => 
    (syllabus.number || "").trim().toLowerCase() === trimmedNumber
  );

  if (isLoading) {
    return (
      <Card>
        <Card.Header>Syllabi</Card.Header>
        <div className="p-4 text-center text-gray-500">Loading syllabi...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Header>Syllabi</Card.Header>
        <div className="p-4 text-center text-red-500">Error loading syllabi. Please try again later.</div>
      </Card>
    );
  }

  if (courseSyllabi.length === 0) {
    return (
      <Card>
        <Card.Header>Syllabi</Card.Header>
        <div className="p-4 text-center text-gray-500">No syllabus available for this course.</div>
      </Card>
    );
  }

  const sortedSyllabi = [...courseSyllabi].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    
    // Use Record<string, number> to tell TypeScript this object can be indexed with any string
    const seasonOrder: Record<string, number> = { "spring": 1, "fall": 0 };
    
    return (seasonOrder[b.season.toLowerCase()] || 0) - (seasonOrder[a.season.toLowerCase()] || 0);
  });

  // Convert syllabi data to table row format
  const tableData: SyllabusRow[] = sortedSyllabi.map(syllabus => {
    const courseCode = trimmedNumber.toUpperCase();
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

  return (
    <Card>
      <Card.Header>Syllabi</Card.Header>
      <div className="mt-3 overflow-x-auto rounded p-4 bg-gray-50">
        <SyllabusDataTable data={tableData} />
      </div>
    </Card>
  );
};

export default SyllabusCard;
