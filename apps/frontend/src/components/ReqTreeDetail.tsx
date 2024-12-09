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
  // State to track expanded nodes
  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({});

  // Toggle expand/collapse
  const toggleExpand = (courseID: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [courseID]: !prev[courseID],
    }));
  };

  // Recursive rendering function for the tree
  const renderTree = (node: TreeNode) => (
    <div key={node.courseID} style={{ margin: "10px 0", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Expand/Collapse Button */}
        {node.prereqs || node.postreqs ? (
          <button
            onClick={() => toggleExpand(node.courseID)}
            style={{
              marginRight: "8px",
              padding: "2px 6px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              backgroundColor: "#f3f4f6",
              cursor: "pointer",
            }}
          >
            {expandedNodes[node.courseID] ? "▼" : "▶"}
          </button>
        ) : (
          <div style={{ width: "20px", height: "1px", marginRight: "8px" }}></div>
        )}

        {/* Course Link */}
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
      </div>

      {/* Expand Prerequisites */}
      {expandedNodes[node.courseID] && node.prereqs && (
        <div style={{ marginLeft: "20px", marginTop: "10px" }}>
          {node.prereqs.map(renderTree)}
        </div>
      )}

      {/* Expand Postrequisites */}
      {expandedNodes[node.courseID] && node.postreqs && (
        <div style={{ marginLeft: "20px", marginTop: "10px" }}>
          {node.postreqs.map(renderTree)}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {renderTree(root)}
    </div>
  );
};

export default ReqTreeDetail;
