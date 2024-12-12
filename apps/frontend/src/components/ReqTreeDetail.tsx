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
    <div className="flex items-center justify-center">
      {/* Prerequisites on the Left */}
      {root.prereqs && root.prereqs.length > 0 && (
        <div className="flex flex-col items-end">
          {root.prereqs.map((prereq) => (
            <div key={prereq.courseID} className="flex items-center">
              {expandedPreReqID === prereq.courseID && (
                <div>
                  <PreReqCourses courseID={prereq.courseID} />
                </div>
              )}

              {/* Line left to expansion button */}
              <div className="w-[10px] h-[1px] bg-gray-300"></div>

              <button
              aria-label={`Toggle prerequisites for ${prereq.courseID}`}
              className="px-2 py-1 bg-[#007fff] text-white border-none rounded cursor-pointer text-sm"
              onClick={() => togglePreReqs(prereq.courseID)}
              >
                {expandedPreReqID === prereq.courseID ? ">" : "<"}
              </button>

              {/* Line connector left to node */}
              <div className="w-[10px] h-[1px] bg-[#d1d5db]]"></div>

              <Link href={`/course/${prereq.courseID}`} passHref>
                <div
                className="font-normal text-center px-2 py-1 text-base bg-[#f9fafb] text-[#111827] border border-[#d1d5db] rounded shadow cursor-pointer min-w-[80px] mt-[2px] mb-[2px]"
                >
                  {prereq.courseID}
                </div>

              </Link>

              {/* Line connector right to node */}
              {root.prereqs && root.prereqs.length > 1 && (
                <div className="w-[20px] h-[1px] bg-[#d1d5db]"></div>
              )}

              {/* Half vertical line for the first prereq in the list */}
              {root.prereqs && root.prereqs.length > 1 && root.prereqs.indexOf(prereq) === 0 && (
                <div className="w-[1px] h-[20px] bg-[#d1d5db] mt-[20px]"></div>
              )}

              {/* Normal vertical Line connector */}
              {root.prereqs && root.prereqs.length > 1 && root.prereqs.indexOf(prereq) !== 0 && root.prereqs.indexOf(prereq) !== root.prereqs.length - 1 && (
                <div className="w-[1px] bg-[#d1d5db] self-stretch"></div>
              )}

              {/* Half vertical line for the last prereq in the list */}
              {root.prereqs && root.prereqs.length > 1 && root.prereqs.indexOf(prereq) === root.prereqs.length - 1 && (
                <div className="w-[1px] h-[20px] bg-[#d1d5db] mb-[20px]"></div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Main Course in the Center with Corequisites Above and Below */}
      <div className="flex flex-col items-center">
        {/* Corequisites Above */}
        {root.coreqs && root.coreqs.length > 0 && (
          <div className="text-center">
            {root.coreqs.slice(0, Math.ceil(root.coreqs.length / 2)).map((coreq) => (
              <Link href={`/course/${coreq.courseID}`} passHref key={coreq.courseID}>
                <div
                className="font-normal text-center px-2 py-1 text-base bg-[#f9fafb] text-[#111827] border border-[#d1d5db] rounded shadow cursor-pointer min-w-[80px] mt-[2px] mb-[2px]"
                >
                  {coreq.courseID}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Main Course */}
        <div className="flex items-center">
          {/* Line connector */}
          {root.prereqs && root.prereqs.length > 0 && (
            <div className="w-[20px] h-[1px] bg-[#d1d5db]"></div>
          )}

          {/* root node */}
          <div
          className="font-bold text-center px-2 py-1 text-base bg-[#e5e7eb] text-[#111827] border border-[#9ca3af] rounded shadow-md min-w-[80px] mt-[10px] mb-[10px]"
          >
            {root.courseID}
          </div>

          {/* Line connector */}
          {root.postreqs && root.postreqs.length > 0 && (
            <div className="w-[20px] h-[1px] bg-[#d1d5db]"></div>
          )}
        </div>

        {/* Corequisites Below */}
        {root.coreqs && root.coreqs.length > 0 && (
          <div className="text-center">
            {root.coreqs.slice(Math.ceil(root.coreqs.length / 2)).map((coreq) => (
              <Link href={`/course/${coreq.courseID}`} passHref key={coreq.courseID}>
                <div
                className="font-normal text-center px-2 py-1 text-base bg-[#f9fafb] text-[#111827] border border-[#d1d5db] rounded shadow cursor-pointer min-w-[80px] mt-[2px] mb-[2px]"
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
        <div className="flex flex-col items-start">
          {root.postreqs.map((postreq) => (
            <div key={postreq.courseID} className="flex items-center">
              {/* Half vertical line for the first postreq */}
              {root.postreqs && root.postreqs.length > 1 && root.postreqs.indexOf(postreq) === 0 && (
                <div className="w-[1px] h-[20px] bg-[#d1d5db] mt-[20px]"></div>
              )}

              {/* Normal vertical Line connector */}
              {root.postreqs && root.postreqs.length > 1 && root.postreqs.indexOf(postreq) !== 0 && root.postreqs.indexOf(postreq) !== root.postreqs.length - 1 && (
                <div className="w-[1px] bg-[#d1d5db] self-stretch"></div>
              )}

              {/* Half vertical line for the last postreq */}
              {root.postreqs && root.postreqs.length > 1 && root.postreqs.indexOf(postreq) === root.postreqs.length - 1 && (
                <div className="w-[1px] h-[20px] bg-[#d1d5db] mb-[20px]"></div>
              )}

              {/* Line connector right to postreqs */}
              <div className="w-[20px] h-[1px] bg-[#d1d5db]"></div>

              <Link href={`/course/${postreq.courseID}`} passHref>
              <div
              className="font-normal text-center px-2 py-1 text-base bg-[#f9fafb] text-[#111827] border border-[#d1d5db] rounded shadow cursor-pointer min-w-[80px] mt-[2px] mb-[2px]"
              >
                {postreq.courseID}
              </div>
              </Link>

              {/* Line connector right to node */}
              <div className="w-[10px] h-[1px] bg-[#d1d5db]"></div>

              <button
              aria-label={`Toggle post-requisites for ${postreq.courseID}`}
              className= "px-2 py-1 bg-[#007fff] text-white border-none rounded cursor-pointer text-sm"
              onClick={() => togglePostReqs(postreq.courseID)}
              >
                {expandedPostReqID === postreq.courseID ? "<" : ">"}
              </button>


              {/* Line right to expansion button */}
              <div className="w-[10px] h-[1px] bg-[#d1d5db]"></div>

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