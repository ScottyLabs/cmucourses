import React from "react";
import { Card } from "./Card";
import { useFetchSyllabi } from "~/app/api/syllabi";
import { Syllabus } from "~/app/types";

interface SyllabusCardProps {
  number: string;
}

const SyllabusCard: React.FC<SyllabusCardProps> = ({ number }) => {
  const trimmedNumber = number.trim().toLowerCase();
  const { data: syllabi, isLoading, error } = useFetchSyllabi([trimmedNumber]);

  const courseSyllabi = !syllabi ? [] : syllabi.filter((syllabus: Syllabus) => 
    (syllabus.number || "").trim().toLowerCase() === trimmedNumber
  );

  if (isLoading) {
    return (
      <Card>
        <Card.Header>Course Syllabus</Card.Header>
        <div className="p-4 text-center text-gray-500">Loading syllabi...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Header>Course Syllabus</Card.Header>
        <div className="p-4 text-center text-red-500">Error loading syllabi. Please try again later.</div>
      </Card>
    );
  }

  if (courseSyllabi.length === 0) {
    return (
      <Card>
        <Card.Header>Course Syllabus</Card.Header>
        <div className="p-4 text-center text-gray-500">No syllabus available for this course.</div>
      </Card>
    );
  }

  const sortedSyllabi = [...courseSyllabi].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    const seasonOrder = { "spring": 1, "fall": 0 };
    return (seasonOrder[b.season.toLowerCase()] || 0) - (seasonOrder[a.season.toLowerCase()] || 0);
  });

  return (
    <Card>
      <Card.Header>Course Syllabus</Card.Header>
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

export default SyllabusCard;
