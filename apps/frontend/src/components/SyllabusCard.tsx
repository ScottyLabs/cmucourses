import React, { useMemo } from "react";
import { Card } from "./Card";
import { useFetchSyllabi } from "~/app/api/syllabi";
import { Syllabus } from "~/app/types";

interface SyllabusCardProps {
  department: string;
  number: string;
}

const SyllabusCard: React.FC<SyllabusCardProps> = ({ department, number }) => {
  const { data: syllabi, isLoading, error } = useFetchSyllabi([number]);

  const courseSyllabi = useMemo(() => {
    if (!syllabi) return [];
    
    return syllabi.filter(syllabus => {
      const syllabusDept = syllabus.department?.trim().toLowerCase() || '';
      const syllabusNum = syllabus.number?.trim().toLowerCase() || '';
      const targetDept = department?.trim().toLowerCase() || '';
      const targetNum = number?.trim().toLowerCase() || '';
      
      return syllabusDept === targetDept && syllabusNum === targetNum;
    });
  }, [syllabi, department, number]);

  // TODO: Sort syllabi by year (newest first) and then by season

  return (
    <Card>
      <Card.Header>Course Syllabus</Card.Header>
      <div>
        {isLoading ? (
          <div>Loading syllabi...</div>
        ) : error ? (
          <div>
            Error loading syllabi. Please try again later.
          </div>
        ) : courseSyllabi.length === 0 ? (
          <div className="italic text-gray-800 p-10 text-center">
            No syllabi available for this course.
          </div>
        ) : (
          courseSyllabi.map((syllabus) => (
            <a
              key={`${syllabus.season}-${syllabus.year}-${syllabus.section}`}
              href={syllabus.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-md hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">
                    {syllabus.season} {syllabus.year}
                  </span>
                  {syllabus.section && (
                    <span className="ml-2 text-gray-500">Section {syllabus.section}</span>
                  )}
                </div>
                <div className="text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </Card>
  );
};

export default SyllabusCard;