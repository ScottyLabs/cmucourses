import React from "react";
import { Card } from "./Card";
import ReqTreeDetail from "./ReqTreeDetail";

interface TreeNode {
  courseID: string;
  prereqs?: TreeNode[];
  prereqRelations?: TreeNode[][];
  postreqs?: TreeNode[];
  coreqs?: Array<{ courseID: string }>;
}

interface ReqTreeCardProps {
  courseID: string;
  prereqs: string[];
  prereqRelations: string[][];
  postreqs: string[];
  coreqs: string[];
}

const ReqTreeCard: React.FC<ReqTreeCardProps> = ({ courseID, prereqs, prereqRelations, postreqs, coreqs }) => {
  const hasNoRequisites = prereqs.length === 0 && postreqs.length === 0 && coreqs.length === 0;

  const buildTree = (id: string, prereqList: string[], prereqRelationsList: string[][], postreqList: string[], coreqList: string[]): TreeNode => {
    return {
      courseID: id,
      prereqs: prereqList.map((prereq) => ({ courseID: prereq })),
      prereqRelations: prereqRelationsList.map((prereqSubList) => (prereqSubList.map((prereq) => ({ courseID: prereq })))),
      postreqs: postreqList.map((postreq) => ({ courseID: postreq })),
      coreqs: coreqList.map((coreq) => ({ courseID: coreq })),
    };
  };

  const tree = buildTree(courseID, prereqs, prereqRelations, postreqs, coreqs);

  return (
    <Card>
      <Card.Header>Requisite Tree</Card.Header>
      {hasNoRequisites ? (
        <div className="italic text-[#6b7280] p-[20px] text-center">
          There are no prerequisites, corequisites, or postrequisites for this course.
        </div>      
      ) : (
        <ReqTreeDetail root={tree} />
      )}

    </Card>
  );
};

export default ReqTreeCard;