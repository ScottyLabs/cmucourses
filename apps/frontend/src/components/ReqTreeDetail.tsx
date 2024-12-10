import React, { useState } from "react";
import Link from "next/link";
import PostReqCourses from "./PostReqCourses"; // Import PostReqCourses component
import PreReqCourses from "./PreReqCourses";   // Import PreReqCourses component

interface TreeNode {
  courseID: string;
  coreqs?: Array<{ courseID: string }>;
  prereqs?: TreeNode[];
  postreqs?: TreeNode[];
}

interface ReqTreeProps {
  root: TreeNode;
}

const ReqTreeDetail: React.FC<ReqTreeProps> = ({ root }) => {
  const [expandedPostReqID, setExpandedPostReqID] = useState<string | null>(null);
  const [expandedPreReqID, setExpandedPreReqID] = useState<string | null>(null); // New state for prerequisites

  const togglePostReqs = (courseID: string) => {
    setExpandedPostReqID((prev) => (prev === courseID ? null : courseID));
  };

  const togglePreReqs = (courseID: string) => {
    setExpandedPreReqID((prev) => (prev === courseID ? null : courseID));
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Prerequisites on the Left */}
      {root.prereqs && root.prereqs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginRight: "20px" }}>
          {root.prereqs.map((prereq) => (
            <div
              key={prereq.courseID}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
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
                    minWidth: "80px",
                  }}
                >
                  {prereq.courseID}
                </div>
              </Link>
              <button
                aria-label={`Toggle prerequisites for ${prereq.courseID}`}
                style={{
                  marginLeft: "5px",
                  padding: "5px 10px",
                  backgroundColor: "#007BFF",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
                onClick={() => togglePreReqs(prereq.courseID)}
              >
                {expandedPreReqID === prereq.courseID ? "Hide" : "View More"}
              </button>
              {expandedPreReqID === prereq.courseID && (
                <div style={{ marginTop: "10px", marginLeft: "20px" }}>
                  <PreReqCourses courseID={prereq.courseID} />
                </div>
              )}
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
          minWidth: "80px",
        }}
      >
        {root.courseID}
      </div>

      {/* Corequisites below the Main Course */}
      {root.coreqs && root.coreqs.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          <div style={{ fontWeight: "bold" }}>Corequisites:</div>
          {root.coreqs.map((coreq) => (
            <Link href={`/course/${coreq.courseID}`} passHref key={coreq.courseID}>
              <div
                style={{
                  marginLeft: "20px",
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
                  minWidth: "80px",
                  marginBottom: "10px",
                }}
              >
                {coreq.courseID}
              </div>
            </Link>
          ))}
        </div>
      )}

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
                    minWidth: "80px",
                    marginRight: "10px",
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
                  backgroundColor: "#007BFF",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
                onClick={() => togglePostReqs(postreq.courseID)}
              >
                {expandedPostReqID === postreq.courseID ? "Hide" : "View More"}
              </button>
              {expandedPostReqID === postreq.courseID && (
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