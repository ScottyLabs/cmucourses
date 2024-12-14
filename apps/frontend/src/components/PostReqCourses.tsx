import React from "react";
import { useFetchCourseRequisites } from "~/app/api/course";
import { TreeNode } from "~/app/types";
import { CourseIDButton } from "./Buttons";

interface Props {
  courseID: string;
}

export const PostReqCourses = ({ courseID }: Props) => {
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
            {/* Half vertical line for the first postreq */}
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

            {/* Line left to node */}
            {nodes && nodes.length > 1 && (
              <div className="w-3 h-0.5 bg-gray-400"></div>
            )}

            {/* Course ID button */}
            <CourseIDButton courseID={node.courseID} />

            {/* Render child nodes recursively */}
            {node.postreqs && renderTree(node.postreqs)}
          </div>
        ))}
      </div>
    );
  };

  // Transform fetched data into a tree structure excluding the parent node
  const childNodes: TreeNode[] = requisites.postreqs?.map((postreq: string) => ({
    courseID: postreq,
  })) || [];

  return (
    <div>
      {childNodes.length > 0 ? (
        renderTree(childNodes)
      ) : (
        <div
          className="italic ml-2 text-gray-700 text-center text-lg font-semibold rounded-md"
        >
          None
        </div>
      )}
    </div>
  );
};

export default PostReqCourses;