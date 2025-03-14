import React, { useMemo } from "react";
import { Card } from "./Card";
import { useFetchSyllabi } from "~/app/api/syllabi";
import { Syllabus } from "~/app/types";

interface SyllabusCardProps {
  number: string;
}

const SyllabusCard: React.FC<SyllabusCardProps> = ({ number }) => {
  const adjustedNumber = useMemo(() => {
    const trimmed = number.trim();
    return trimmed;
  }, [number]);

  const { data: syllabi, isLoading, error } = useFetchSyllabi([adjustedNumber]);
  
  const courseSyllabi = useMemo(() => {
    if (!syllabi) return [];
    return syllabi.filter((syllabus) => {
      const syllabusNum = (syllabus.number || "").trim().toLowerCase();
      return syllabusNum === adjustedNumber.toLowerCase();
    });
  }, [syllabi, adjustedNumber]);

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

  // Show the URL of the first matching syllabus
  const syllabus = courseSyllabi[0];

  return (
    <Card>
      <Card.Header>Course Syllabus</Card.Header>
      <a
        href={syllabus.url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline block p-4"
      >
        View Syllabus
      </a>
    </Card>
  );
};

export default SyllabusCard;
