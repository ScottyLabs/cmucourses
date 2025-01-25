import React from "react";

export const SmallButton = ({
  onClick,
  children,
}: {
  onClick: React.MouseEventHandler<HTMLDivElement>;
  children: React.ReactNode;
}) => {
  return (
    <div
      className="text-gray-600 bg-gray-50 cursor-pointer rounded py-1 px-2 text-sm hover:bg-gray-100"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const FlushedButton = ({
  onClick,
  children,
}: {
  onClick: React.MouseEventHandler<HTMLDivElement>;
  children: React.ReactNode;
}) => {
  return (
    <div
      className="text-gray-700 cursor-pointer rounded py-1 px-2 text-sm hover:bg-gray-50"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CourseIDButton = ({ courseID }: { courseID: string }) => {
  return (
    <button
      onClick={() => (window.location.href = `/course/${courseID}`)}
      className="font-normal text-center px-2 py-1 text-base bg-gray-50 hover:bg-gray-200 text-gray-900 border border-gray-300 rounded shadow cursor-pointer no-underline min-w-20 inline mt-1 mb-1"
    >
      {courseID}
    </button>
  );
};
