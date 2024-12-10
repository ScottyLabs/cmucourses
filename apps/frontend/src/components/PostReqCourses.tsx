import React from "react";
import Link from "next/link"; // Import Next.js Link component
import { useFetchCourseInfo } from "~/app/api/course";

interface TreeNode {
  courseID: string;
  postreqs?: TreeNode[];
}

interface Props {
  courseID: string;
}

export const PostReqCourses = ({ courseID }: Props) => {
  const { isPending: isCourseInfoPending, data: info } = useFetchCourseInfo(courseID);

  if (isCourseInfoPending || !info) {
    return null;
  }

  // Recursive function to render only the child branches
  const renderTree = (nodes: TreeNode[]) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", marginLeft: "20px" }}>
        {nodes.map((node) => (
          <div
            key={node.courseID}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            {/* Line connector */}
            <div
              style={{
                width: "20px",
                height: "1px",
                backgroundColor: "#d1d5db",
                marginRight: "10px",
              }}
            ></div>

            {/* Course ID button */}
            <button
              onClick={() => window.location.href = `/course/${node.courseID}`}
              style={{
                fontWeight: "normal",
                textAlign: "center",
                padding: "5px 10px",
                fontSize: "14px",
                backgroundColor: "#f9fafb",
                color: "#111827",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
                cursor: "pointer",
                textDecoration: "none",
                minWidth: "100px", // Ensure consistent width
                display: "inline-block",
              }}
            >
              {node.courseID}
            </button>

            {/* Render child nodes recursively */}
            {node.postreqs && renderTree(node.postreqs)}
          </div>
        ))}
      </div>
    );
  };

  // Transform fetched data into a tree structure excluding the parent node
  const childNodes: TreeNode[] = info.postreqs?.map((postreq: string) => ({
    courseID: postreq,
  })) || [];

  return (
    <div>
      {childNodes.length > 0 ? (
        renderTree(childNodes)
      ) : (
        <div
          style={{
            fontStyle: "italic",
            color: "#000000",
            textAlign: "center",
            fontSize: "14px",
            marginTop: "-10px",
            fontWeight: "bold",
          }}
        >
          No further post-requisites
        </div>
      )}
    </div>
  );
};

export default PostReqCourses;
