import React, { useState } from "react";
import Link from "next/link";

interface TreeNode {
  courseID: string;
  prereqs?: TreeNode[];
  postreqs?: TreeNode[];
}

interface ReqTreeProps {
  root: TreeNode;
}

const ReqTreeDetail: React.FC<ReqTreeProps> = ({ root }) => {
  const [expandedCourses, setExpandedCourses] = useState<string[]>([]);

  const toggleExpand = (courseID: string) => {
    setExpandedCourses((prev) =>
      prev.includes(courseID)
        ? prev.filter((id) => id !== courseID)
        : [...prev, courseID]
    );
  };

  const renderTree = (node: TreeNode) => (
    <div key={node.courseID} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
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
      {node.prereqs && node.prereqs.length > 0 && (
        <>
          <button onClick={() => toggleExpand(node.courseID)} style={{ marginLeft: "5px" }}>
            {expandedCourses.includes(node.courseID) ? "▲" : "▼"}
          </button>
          {expandedCourses.includes(node.courseID) && (
            <div style={{ marginLeft: "20px" }}>
              {node.prereqs.map((prereq) => renderTree(prereq))}
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      {root.prereqs && root.prereqs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginRight: "20px" }}>
          {root.prereqs.map((prereq) => renderTree(prereq))}
        </div>
      )}
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
      {root.postreqs && root.postreqs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginLeft: "20px" }}>
          {root.postreqs.map((postreq) => renderTree(postreq))}
        </div>
      )}
    </div>
  );
};

export default ReqTreeDetail;