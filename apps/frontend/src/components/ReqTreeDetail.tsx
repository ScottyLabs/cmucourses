import React, { useState } from "react";
import Link from "next/link"; // Import Next.js Link component

interface TreeNode {
  courseID: string;
  prereqs?: TreeNode[];
  postreqs?: TreeNode[];
}

interface ReqTreeProps {
  root: TreeNode;
}

const ReqTreeDetail: React.FC<ReqTreeProps> = ({ root }) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleExpand = (courseID: string) => {
    setExpandedNodes((prev) => ({ ...prev, [courseID]: !prev[courseID] }));
  };

  const renderPrereqs = (node: TreeNode, depth: number = 0) => {
    if (!node.prereqs || node.prereqs.length === 0) return null;

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginRight: `${20 * depth}px` }}>
        {node.prereqs.map((prereq) => (
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
                }}
              >
                {prereq.courseID}
              </div>
            </Link>
            {prereq.prereqs && prereq.prereqs.length > 0 && (
              <button
                onClick={() => toggleExpand(prereq.courseID)}
                style={{
                  marginLeft: "5px",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "#1d4ed8",
                }}
              >
                {expandedNodes[prereq.courseID] ? "▲" : "▼"}
              </button>
            )}
            {expandedNodes[prereq.courseID] && renderPrereqs(prereq, depth + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Prerequisites on the Left */}
      {root.prereqs && root.prereqs.length > 0 && renderPrereqs(root)}

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
        }}
      >
        {root.courseID}
      </div>

      {/* Postrequisites on the Right */}
      {root.postreqs && root.postreqs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginLeft: "20px" }}>
          {root.postreqs.map((postreq) => (
            <div key={postreq.courseID} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
              <div
                style={{
                  width: "20px",
                  height: "1px",
                  backgroundColor: "#d1d5db",
                  marginRight: "5px",
                }}
              ></div>
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
                  }}
                >
                  {postreq.courseID}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReqTreeDetail;
