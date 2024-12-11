import React from "react";
import { Card } from "./Card";
import ReqTreeDetail from "./ReqTreeDetail";

interface TreeNode {
  courseID: string;
  prereqs?: TreeNode[];
  postreqs?: TreeNode[];
  coreqs?: Array<{ courseID: string }>; // Ensure coreqs are included
}

interface ReqTreeCardProps {
  courseID: string;
  prereqs: string[];
  postreqs: string[];
  coreqs: string[]; // Ensure coreqs are included
}

const ReqTreeCard: React.FC<ReqTreeCardProps> = ({ courseID, prereqs, postreqs, coreqs }) => {
  const hasNoRequisites = prereqs.length === 0 && postreqs.length === 0 && coreqs.length === 0;

  const buildTree = (id: string, prereqList: string[], postreqList: string[], coreqList: string[]): TreeNode => {
    return {
      courseID: id,
      prereqs: prereqList.map((prereq) => ({ courseID: prereq })),
      postreqs: postreqList.map((postreq) => ({ courseID: postreq })),
      coreqs: coreqList.map((coreq) => ({ courseID: coreq })), // Ensure coreqs are included
    };
  };

  const tree = buildTree(courseID, prereqs, postreqs, coreqs);

  return (
    <Card>
      <Card.Header>Requisite Tree</Card.Header>
      {hasNoRequisites ? (
        <div style={{ fontStyle: "italic", color: "#6b7280", padding: "20px", textAlign: "center" }}>
          There are no prerequisites, corequisites, or postrequisites for this course.
        </div>
      ) : (
        <ReqTreeDetail root={tree} />
      )}

    </Card>
  );
};

export default ReqTreeCard;