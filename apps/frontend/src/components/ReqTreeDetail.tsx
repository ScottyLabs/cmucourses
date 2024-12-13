import React, { useState } from "react";
import Link from "next/link";
import PostReqCourses from "./PostReqCourses";
import PreReqCourses from "./PreReqCourses";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";
import { FlushedButton } from "./Buttons";

interface TreeNode {
  courseID: string;
  coreqs?: Array<{ courseID: string }>;
  prereqs?: TreeNode[];
  prereqRelations?: TreeNode[][];
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
    <div className="flex items-center justify-center overflow-x-scroll">
      {/* Prereqs on the left */}
      {root.prereqs && root.prereqs.length > 0 && (
        <div className="flex flex-col items-end justify-center">
          {root.prereqs.map((prereq) => (
            <div key={prereq.courseID} className="flex items-center justify-center">

              {/* Next level of prereqs */}
              {expandedPreReqID === prereq.courseID && (
                <div className="flex items-center justify-center">
                  <PreReqCourses courseID={prereq.courseID} />
                  <div className="w-3 h-0.5 bg-gray-400"></div>
                </div>
              )}

              {/* Expansion button */}
              <button className="right-3 top-3 z-40 md:top-4 md:right-2">
                <FlushedButton
                  onClick={() => togglePreReqs(prereq.courseID)}
                >
                  {expandedPreReqID === prereq.courseID ?
                    <div className="hidden items-center md:flex">
                      <div className="mr-1">Hide</div>
                      <ChevronRightIcon className="h-5 w-5" />
                    </div>
                    :
                    <div className="hidden items-center md:flex">
                      <ChevronLeftIcon className="h-5 w-5" />
                    </div>
                  }
                </FlushedButton>
              </button>

              {/* Line right to expansion button */}
              <div className="w-3 h-0.5 bg-gray-400"></div>

              {/* Course ID button */}
              <button
                onClick={() => (window.location.href = `/course/${prereq.courseID}`)}
                className="font-normal text-center px-2 py-1 text-base bg-[#f9fafb] text-[#111827] border border-[#d1d5db] rounded shadow cursor-pointer no-underline min-w-[80px] inline mt-[2px] mb-[2px]"
              >
                {prereq.courseID}
              </button>

              {/* Line connector right to node */}
              {root.prereqs && root.prereqs.length > 1 && (
                <div className="w-3 h-0.5 bg-gray-400"></div>
              )}

              {/* Half vertical line for the first prereq in the list */}
              {root.prereqs && root.prereqs.length > 1 && root.prereqs.indexOf(prereq) === 0 && (
                <div className="flex flex-col w-0.5 self-stretch">
                  <div className="h-1/2 self-stretch"></div>
                  <div className="w-0.5 h-1/2 bg-gray-400 self-stretch"></div>
                </div>
              )}

              {/* Normal vertical Line connector */}
              {root.prereqs && root.prereqs.length > 1 && root.prereqs.indexOf(prereq) !== 0 && root.prereqs.indexOf(prereq) !== root.prereqs.length - 1 && (
                <div className="w-0.5 bg-gray-400 self-stretch"></div>
              )}

              {/* Half vertical line for the last prereq in the list */}
              {root.prereqs && root.prereqs.length > 1 && root.prereqs.indexOf(prereq) === root.prereqs.length - 1 && (
                <div className="flex flex-col w-0.5 self-stretch">
                  <div className="w-0.5 h-1/2 bg-gray-400 self-stretch"></div>
                  <div className="h-1/2 self-stretch"></div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Main Course */}
      <div className="flex items-center">
        {/* Line left to node */}
        {root.prereqs && root.prereqs.length > 0 && (
          <div className="w-3 h-0.5 bg-gray-400"></div>
        )}

        {/* Main node */}
        <div
          className="font-bold text-center px-2 py-1 text-base bg-[#e5e7eb] text-[#111827] border border-[#9ca3af] rounded shadow-md min-w-[80px] mt-[10px] mb-[10px]"
        >
          {root.courseID}
        </div>

        {/* Line right to node */}
        {root.postreqs && root.postreqs.length > 0 && (
          <div className="w-3 h-0.5 bg-gray-400"></div>
        )}
      </div>

      {/* Postreqs on the right */}
      {root.postreqs && root.postreqs.length > 0 && (
        <div className="flex flex-col items-start justify-center">
          {root.postreqs.map((postreq) => (
            <div key={postreq.courseID} className="flex items-center justify-center">
              {/* Half vertical line for the first postreq */}
              {root.postreqs && root.postreqs.length > 1 && root.postreqs.indexOf(postreq) === 0 && (
                <div className="flex flex-col w-0.5 self-stretch">
                  <div className="h-1/2 self-stretch"></div>
                  <div className="w-0.5 h-1/2 bg-gray-400 self-stretch"></div>
                </div>
              )}

              {/* Normal vertical Line connector */}
              {root.postreqs && root.postreqs.length > 1 && root.postreqs.indexOf(postreq) !== 0 && root.postreqs.indexOf(postreq) !== root.postreqs.length - 1 && (
                <div className="w-0.5 bg-gray-400 self-stretch"></div>
              )}

              {/* Half vertical line for the last postreq */}
              {root.postreqs && root.postreqs.length > 1 && root.postreqs.indexOf(postreq) === root.postreqs.length - 1 && (
                <div className="flex flex-col w-0.5 self-stretch">
                  <div className="w-0.5 h-1/2 bg-gray-400 self-stretch"></div>
                  <div className="h-1/2 self-stretch"></div>
                </div>
              )}

              {/* Line left to node */}
              <div className="w-3 h-0.5 bg-gray-400"></div>

              {/* Course ID button */}
              <button
                onClick={() => (window.location.href = `/course/${postreq.courseID}`)}
                className="font-normal text-center px-2 py-1 text-base bg-[#f9fafb] text-[#111827] border border-[#d1d5db] rounded shadow cursor-pointer no-underline min-w-[80px] inline mt-[2px] mb-[2px]"
              >
                {postreq.courseID}
              </button>

              {/* Line right to node */}
              <div className="w-3 h-0.5 bg-gray-400"></div>

              {/* Expansion button */}
              <button className="right-3 top-3 z-40 md:top-4 md:right-2">
                <FlushedButton
                  onClick={() => togglePostReqs(postreq.courseID)}
                >
                  {expandedPostReqID === postreq.courseID ?
                    <div className="hidden items-center md:flex">
                      <div className="mr-1">Hide</div>
                      <ChevronLeftIcon className="h-5 w-5" />
                    </div>
                    :
                    <div className="hidden items-center md:flex">
                      <ChevronRightIcon className="h-5 w-5" />
                    </div>
                  }
                </FlushedButton>
              </button>

              {/* Next level of postreqs */}
              {expandedPostReqID === postreq.courseID && (
                <div className="flex items-center justify-center">
                  <div className="w-3 h-0.5 bg-gray-400"></div>
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