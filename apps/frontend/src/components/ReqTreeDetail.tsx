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
  const [expandedPreReqID, setExpandedPreReqID] = useState<string | null>(null);

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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          {root.prereqs.map((prereq) => (
            <div
              key={prereq.courseID}
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >

              {expandedPreReqID === prereq.courseID && (
                <div>
                  <PreReqCourses courseID={prereq.courseID} />
                </div>
              )}

              {/* Line left to expansion button */}
              <div
                style={{
                  width: "10px",
                  height: "1px",
                  backgroundColor: "#d1d5db",
                }}
              ></div>

              <button
                aria-label={`Toggle prerequisites for ${prereq.courseID}`}
                style={{
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
                {expandedPreReqID === prereq.courseID ? ">" : "<"}
              </button>

              {/* Line connector left to node */}
              <div
                style={{
                  width: "10px",
                  height: "1px",
                  backgroundColor: "#d1d5db",
                }}
              ></div>

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
                    marginTop: "2px",
                    marginBottom: "2px",
                  }}
                >
                  {prereq.courseID}
                </div>
              </Link>

              {/* Line connector right to node */}
              {root.prereqs && root.prereqs.length > 1 && (
                <div
                  style={{
                    width: "20px",
                    height: "1px",
                    backgroundColor: "#d1d5db",
                  }}
                ></div>
              )}

              {/* Half vertical line for the first prereq in the list */}
              {root.prereqs && root.prereqs.length > 1 && root.prereqs.indexOf(prereq) === 0 && (
                <div
                  style={{
                    width: "1px",
                    height: "20px",
                    backgroundColor: "#d1d5db",
                    marginTop: "20px",
                  }}
                ></div>
              )}

              {/* Normal vertical Line connector */}
              {root.prereqs && root.prereqs.length > 1 && root.prereqs.indexOf(prereq) !== 0 && root.prereqs.indexOf(prereq) !== root.prereqs.length - 1 && (
                <div
                  style={{
                    width: "1px",
                    backgroundColor: "#d1d5db",
                    alignSelf: "stretch",
                  }}
                ></div>
              )}

              {/* Half vertical line for the last prereq in the list */}
              {root.prereqs && root.prereqs.length > 1 && root.prereqs.indexOf(prereq) === root.prereqs.length - 1 && (
                <div
                  style={{
                    width: "1px",
                    height: "20px",
                    backgroundColor: "#d1d5db",
                    marginBottom: "20px",
                  }}
                ></div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Main Course in the Center with Corequisites Above and Below */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Corequisites Above */}
        {root.coreqs && root.coreqs.length > 0 && (
          <div style={{ textAlign: "center" }}>
            {root.coreqs.slice(0, Math.ceil(root.coreqs.length / 2)).map((coreq) => (
              <Link href={`/course/${coreq.courseID}`} passHref key={coreq.courseID}>
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
                    marginTop: "2px",
                    marginBottom: "2px",
                  }}
                >
                  {coreq.courseID}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Main Course */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Line connector */}
          {root.prereqs && root.prereqs.length > 0 && (
            <div
              style={{
                width: "20px",
                height: "1px",
                backgroundColor: "#d1d5db",
              }}
            ></div>)}

          {/* root node */}
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
              minWidth: "80px",
              marginTop: "10px",
              marginBottom: "10px",
            }}
          >
            {root.courseID}
          </div>

          {/* Line connector */}
          {root.postreqs && root.postreqs.length > 0 && (
            <div
              style={{
                width: "20px",
                height: "1px",
                backgroundColor: "#d1d5db",
              }}
            ></div>)}
        </div>

        {/* Corequisites Below */}
        {root.coreqs && root.coreqs.length > 0 && (
          <div style={{ textAlign: "center" }}>
            {root.coreqs.slice(Math.ceil(root.coreqs.length / 2)).map((coreq) => (
              <Link href={`/course/${coreq.courseID}`} passHref key={coreq.courseID}>
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
                    marginTop: "2px",
                    marginBottom: "2px",
                  }}
                >
                  {coreq.courseID}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Postrequisites on the Right */}
      {root.postreqs && root.postreqs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          {root.postreqs.map((postreq) => (
            <div
              key={postreq.courseID}
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* Half vertical line for the first postreq */}
              {root.postreqs && root.postreqs.length > 1 && root.postreqs.indexOf(postreq) === 0 && (
                <div
                  style={{
                    width: "1px",
                    height: "20px",
                    backgroundColor: "#d1d5db",
                    marginTop: "20px",
                  }}
                ></div>
              )}

              {/* Normal vertical Line connector */}
              {root.postreqs && root.postreqs.length > 1 && root.postreqs.indexOf(postreq) !== 0 && root.postreqs.indexOf(postreq) !== root.postreqs.length - 1 && (
                <div
                  style={{
                    width: "1px",
                    backgroundColor: "#d1d5db",
                    alignSelf: "stretch",
                  }}
                ></div>
              )}

              {/* Half vertical line for the last postreq */}
              {root.postreqs && root.postreqs.length > 1 && root.postreqs.indexOf(postreq) === root.postreqs.length - 1 && (
                <div
                  style={{
                    width: "1px",
                    height: "20px",
                    backgroundColor: "#d1d5db",
                    marginBottom: "20px", // Move the line to the to half
                  }}
                ></div>
              )}

              {/* Line connector right to postreqs */}
              {root.postreqs && root.postreqs.length > 1 && (
                <div
                  style={{
                    width: "20px",
                    height: "1px",
                    backgroundColor: "#d1d5db",
                  }}
                ></div>
              )}

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
                    marginTop: "2px",
                    marginBottom: "2px",
                  }}
                >
                  {postreq.courseID}
                </div>
              </Link>

              {/* Line connector right to node */}
              <div
                style={{
                  width: "10px",
                  height: "1px",
                  backgroundColor: "#d1d5db",
                }}
              ></div>

              <button
                aria-label={`Toggle post-requisites for ${postreq.courseID}`}
                style={{
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
                {expandedPostReqID === postreq.courseID ? "<" : ">"}
              </button>

              {/* Line right to expansion button */}
              <div
                style={{
                  width: "10px",
                  height: "1px",
                  backgroundColor: "#d1d5db",
                }}
              ></div>

              {expandedPostReqID === postreq.courseID && (
                <div>
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
