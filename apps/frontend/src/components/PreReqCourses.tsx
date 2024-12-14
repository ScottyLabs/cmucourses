import React from "react";
import { useFetchCourseRequisites } from "~/app/api/course";
import { TreeNode } from "~/app/types";

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
              className="font-normal text-center px-2 py-1 text-base bg-gray-50 hover:bg-gray-200 text-gray-900 border border-gray-300 rounded shadow cursor-pointer no-underline min-w-[80px] inline mt-[2px] mb-[2px]"
            >
              {node.courseID}
            </button>

            {/* Line connector right to node */}
            {nodes && nodes.length > 1 && (
              <div className="w-3 h-0.5 bg-gray-400"></div>
            )}

            {/* Half vertical line for the first prereq in the list */}
            {nodes && nodes.length > 1 && nodes.indexOf(node) === 0 && (
              <div className="flex flex-col w-0.5 self-stretch">
                <div className="h-1/2 self-stretch"></div>
                <div className="w-0.5 h-1/2 bg-gray-400 self-stretch"></div>
              </div>
            )}

            {/* Normal vertical Line connector */}
            {nodes && nodes.length > 1 && nodes.indexOf(node) !== 0 && nodes.indexOf(node) !== nodes.length - 1 && (
              <div className="w-0.5 bg-gray-400 self-stretch"></div>
            )}

            {/* Half vertical line for the last prereq in the list */}
            {nodes && nodes.length > 1 && nodes.indexOf(node) === nodes.length - 1 && (
              <div className="flex flex-col w-0.5 self-stretch">
                <div className="w-0.5 h-1/2 bg-gray-400 self-stretch"></div>
                <div className="h-1/2 self-stretch"></div>
              </div>
            )}

            {/* Render child nodes recursively */}
            {node.prereqs && renderTree(node.prereqs)}
          </div>
        ))}
      </div>
    );
  };

  // Transform fetched data into a tree structure excluding the parent node
  const childNodes: TreeNode[] = requisites.prereqs.map((prereq: string) => ({
    courseID: prereq,
  })) || [];

  return (
    <div>
      {childNodes.length > 0 ? (
        renderTree(childNodes)
      ) : (
        <div
          className="italic mr-2 text-gray-700 text-center text-lg font-semibold rounded-md"
        >
          None
        </div>
      )}
    </div>
  );
};

export default PreReqCourses;