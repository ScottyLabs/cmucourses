import React from "react";

export const SmallButton = ({ onClick, children }) => {
  return (
    <div
      className="text-gray-600 bg-gray-50 rounded-md py-1 px-2 text-sm hover:bg-gray-100 hover:cursor-pointer"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const FlushedButton = ({ onClick, children }) => {
  return (
    <div
      className="text-gray-700 rounded-md py-1 px-2 text-sm hover:bg-gray-50 hover:cursor-pointer"
      onClick={onClick}
    >
      {children}
    </div>
  );
};
