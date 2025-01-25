import React from "react";
import { Card } from "./Card";
import ReqTreeDetail from "./ReqTreeDetail";
import { TreeNode } from "~/app/types";

interface ReqTreeCardProps {
  courseID: string;
  prereqs: string[];
  prereqRelations: string[][];
  postreqs: string[];
}

const ReqTreeCard: React.FC<ReqTreeCardProps> = ({
  courseID,
  prereqs,
  prereqRelations,
  postreqs,
}) => {
  const hasNoRequisites = prereqs.length === 0 && postreqs.length === 0;

  const buildTree = (
    id: string,
    prereqList: string[],
    prereqRelationsList: string[][],
    postreqList: string[]
  ): TreeNode => {
    return {
      courseID: id,
      prereqs: prereqList.map((prereq) => ({ courseID: prereq })),
      prereqRelations: prereqRelationsList.map((prereqSubList) =>
        prereqSubList.map((prereq) => ({ courseID: prereq }))
      ),
      postreqs: postreqList.map((postreq) => ({ courseID: postreq })),
    };
  };

  const tree = buildTree(courseID, prereqs, prereqRelations, postreqs);

  return (
    <Card>
      <Card.Header>Requisite Tree</Card.Header>
      {hasNoRequisites ? (
        <div className="italic text-gray-800 p-10 text-center">
          There are no prerequisites or postrequisites for this course.
        </div>
      ) : (
        <ReqTreeDetail root={tree} />
      )}
    </Card>
  );
};

export default ReqTreeCard;
