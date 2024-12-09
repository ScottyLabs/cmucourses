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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (courseID: string) => {
    setExpanded((prev) => ({
      ...prev,
      [courseID]: !prev[courseID],
    }));
  };

  const renderTree = (node: TreeNode, isPrereq = false) => {
    if (!node) return null;

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: isPrereq ? "flex-end" : "flex-start", margin: "10px 0" }}>
        {/* Render Node */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link href={`/course/${node.courseID}`} passHref>
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
              {node.courseID}
            </div>
          </Link>

          {/* Toggle Button */}
          {node.prereqs && node.prereqs.length > 0 && (
            <button
              onClick={() => toggleExpand(node.courseID)}
              style={{
                marginLeft: "5px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                color: "#1d4ed8",
              }}
            >
              {expanded[node.courseID] ? "▲" : "▼"}
            </button>
          )}
        </div>

        {/* Render Children */}
        {expanded[node.courseID] && node.prereqs && (
          <div style={{ marginLeft: isPrereq ? "20px" : "0", marginRight: isPrereq ? "0" : "20px" }}>
            {node.prereqs.map((child) => renderTree(child, isPrereq))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Prerequisites on the Left */}
      {root.prereqs && root.prereqs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginRight: "20px" }}>
          {root.prereqs.map((prereq) => renderTree(prereq, true))}
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
        }}
      >
        {root.courseID}
      </div>

      {/* Postrequisites on the Right */}
      {root.postreqs && root.postreqs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginLeft: "20px" }}>
          {root.postreqs.map((postreq) => renderTree(postreq))}
        </div>
      )}
    </div>
  );
};

export default ReqTreeDetail;
