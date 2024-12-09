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
      <ReqTreeDetail root={tree} />
    </Card>
  );
};

export default ReqTreeCard;
