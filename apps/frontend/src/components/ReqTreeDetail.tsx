import React from "react";

interface TreeNode {
  courseID: string;
  prereqs?: TreeNode[];
  postreqs?: TreeNode[];
}

interface ReqTreeProps {
  root: TreeNode;
}

const ReqTreeDetail: React.FC<ReqTreeProps> = ({ root }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Prerequisites on the Left */}
      {root.prereqs && root.prereqs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginRight: "20px" }}>
          {root.prereqs.map((prereq) => (
            <div key={prereq.courseID} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ fontWeight: "bold", fontSize: "14px", color: "#111827" }}>
                {prereq.courseID}
              </div>
              <div style={{ width: "20px", height: "1px", backgroundColor: "#9ca3af", marginLeft: "5px" }}></div>
            </div>
          ))}
        </div>
      )}

      {/* Main Course in the Center */}
      <div style={{ fontWeight: "bold", fontSize: "14px", color: "#111827", margin: "0 20px" }}>
        {root.courseID}
      </div>

      {/* Postrequisites on the Right */}
      {root.postreqs && root.postreqs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginLeft: "20px" }}>
          {root.postreqs.map((postreq) => (
            <div key={postreq.courseID} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ width: "20px", height: "1px", backgroundColor: "#9ca3af", marginRight: "5px" }}></div>
              <div style={{ fontWeight: "bold", fontSize: "14px", color: "#111827" }}>
                {postreq.courseID}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReqTreeDetail;
