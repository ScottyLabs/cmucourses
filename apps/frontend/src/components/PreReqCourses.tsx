import React from "react";
import { useFetchCourseRequisites } from "~/app/api/course";

interface TreeNode {
  courseID: string;
  prereqs?: TreeNode[];
  prereqRelations?: TreeNode[][];
}

interface Props {
  courseID: string;
}

export const PreReqCourses = ({ courseID }: Props) => {
  const { isPending: isCourseInfoPending, data: requisites } = useFetchCourseRequisites(courseID);

  if (isCourseInfoPending || !requisites) {
    return null;
  }


  // Recursive function to render only the child branches
  const renderTree = (nodes: TreeNode[]) => {
    return (
      <div className="flex flex-col">
        {nodes.map((node) => (
          <div key={node.courseID} className="flex items-center">
            {/* Course ID button */}
            <button
            onClick={() => (window.location.href = `/course/${node.courseID}`)}
            className="font-normal text-center px-2 py-1 text-base bg-[#f9fafb] text-[#111827] border border-[#d1d5db] rounded shadow cursor-pointer no-underline min-w-[80px] inline mt-[2px] mb-[2px]"
            >
              {node.courseID}
            </button>

            {/* Line connector */}
            <div className="w-[20px] h-[1px] bg-[#d1d5db]"></div>

            {/* Half vertical line for the first prereq in the list */}
            {nodes && nodes.length > 1 && nodes.indexOf(node) === 0 && (
              <div className="w-[1px] h-[20px] bg-[#d1d5db] mt-[20px]"></div>
            )}

            {/* Normal vertical Line connector */}
            {nodes && nodes.length > 1 && nodes.indexOf(node) !== 0 && nodes.indexOf(node) !== nodes.length - 1 && (
              <div className="w-[1px] bg-[#d1d5db] self-stretch"></div>
            )}

            {/* Half vertical line for the last prereq in the list */}
            {nodes && nodes.length > 1 && nodes.indexOf(node) === nodes.length - 1 && (
              <div className="w-[1px] h-[20px] bg-[#d1d5db] mb-[20px]"></div>
            )}

            {/* Render child nodes recursively */}
            {node.prereqs && renderTree(node.prereqs)}
          </div>
        ))}
      </div>
    );
  };

  // Transform fetched data into a tree structure excluding the parent node

  const prereqs = requisites.prereqRelations?.flat()

  const childNodes: TreeNode[] = prereqs.map((prereq: string) => ({
    courseID: prereq,
  })) || [];

  return (
    <div>
      {childNodes.length > 0 ? (
        renderTree(childNodes)
      ) : (
        <div className="italic text-[#000000] text-center text-base font-bold">
          No further prerequisites
        </div>
      )}
    </div>
  );
};

export default PreReqCourses;