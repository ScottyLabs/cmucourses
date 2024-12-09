import React, { useState } from "react";
import Link from "next/link";
import PostReqCourses from "./PostReqCourses"; // Import PostReqCourses component

interface TreeNode {
  courseID: string;
  prereqs?: TreeNode[];
  postreqs?: TreeNode[];
}

interface ReqTreeProps {
  root: TreeNode;
}

const ReqTreeDetail: React.FC<ReqTreeProps> = ({ root }) => {
  const [expandedCourseID, setExpandedCourseID] = useState<string | null>(null);

  const togglePostReqs = (courseID: string) => {
    // Toggle expanded state for the course
    setExpandedCourseID((prev) => (prev === courseID ? null : courseID));
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Prerequisites on the Left */}
      {root.prereqs && root.prereqs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginRight: "20px" }}>
          {root.prereqs.map((prereq) => (
            <div key={prereq.courseID} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
              <Link href={`/course/${prereq.courseID}`} passHref>
                <div
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
                    minWidth: "80px", // Consistent width
                  }}
                >
                  {prereq.courseID}
                </div>
              </Link>
              <div
                style={{
                  width: "20px",
                  height: "1px",
                  backgroundColor: "#d1d5db",
                  marginLeft: "5px",
                }}
              ></div>
            </div>
          ))}
        </div>
      )}

      {/* Main Course in the Center */}
      <div
        style={{
          fontWeight: "bold",
          textAlign: "center",
          padding: "5px 10px",
          fontSize: "14px",
          backgroundColor: "#e5e7eb",
          color: "#111827",
          border: "1px solid #9ca3af",
          borderRadius: "4px",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          margin: "0 20px",
          minWidth: "80px", // Consistent width
        }}
      >
        {root.courseID}
      </div>

      {/* Postrequisites on the Right */}
      {root.postreqs && root.postreqs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginLeft: "20px" }}>
          {root.postreqs.map((postreq) => (
            <div
              key={postreq.courseID}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
                justifyContent: "space-between", // Space between course ID and button
              }}
            >
              <Link href={`/course/${postreq.courseID}`} passHref>
                <div
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
                    minWidth: "80px", // Consistent width
                    marginRight: "10px", // Space between course ID and button
                  }}
                >
                  {postreq.courseID}
                </div>
              </Link>
              <button
                aria-label={`Toggle post-requisites for ${postreq.courseID}`}
                style={{
                  marginLeft: "5px",
                  padding: "5px 10px",
                  backgroundColor: "#007BFF", // Button color
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
                onClick={() => togglePostReqs(postreq.courseID)}
              >
                {expandedCourseID === postreq.courseID ? "Hide" : "View More"}
              </button>
              {/* Render PostReqCourses dynamically */}
              {expandedCourseID === postreq.courseID && (
                <div style={{ marginTop: "10px", marginLeft: "20px" }}>
                  <PostReqCourses courseID={postreq.courseID} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReqTreeDetail;
