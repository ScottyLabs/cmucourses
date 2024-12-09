import React from "react";
import { Card } from "./Card";
import ReqTreeDetail from "./ReqTreeDetail";

interface TreeNode {
  courseID: string;
  prereqs?: TreeNode[];
  postreqs?: TreeNode[];
}

interface ReqTreeCardProps {
  courseID: string;
  prereqs: string[];    // Array of prerequisite course IDs
  postreqs: string[];   // Array of postrequisite course IDs
}

const ReqTreeCard: React.FC<ReqTreeCardProps> = ({ courseID, prereqs, postreqs }) => {
  // Check if there are no prerequisites and no postrequisites
  const hasNoRequisites = prereqs.length === 0 && postreqs.length === 0;

  // Build the requisite tree with prereqs and postreqs
  const buildTree = (id: string, prereqList: string[], postreqList: string[]): TreeNode => {
    return {
      courseID: id,
      prereqs: prereqList.map((prereq) => ({ courseID: prereq })),
      postreqs: postreqList.map((postreq) => ({ courseID: postreq })),
    };
  };

  const tree = buildTree(courseID, prereqs, postreqs);

  return (
    <Card>
      <Card.Header>Requisite Tree</Card.Header>
      {hasNoRequisites ? (
        <div style={{ fontStyle: "italic", color: "#6b7280", padding: "20px", textAlign: "center" }}>
          There are no prerequisites or postrequisites for this course.
        </div>
      ) : (
        <ReqTreeDetail root={tree} />
      )}
    </Card>
  );
};

export default ReqTreeCard;
