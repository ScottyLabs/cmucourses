import React from "react";

export const SmallButton = ({ onClick, children }) => {
  return (
    <div
      className="bg-grey-50 text-grey-600 hover:bg-grey-100 rounded-md py-1 px-2 text-sm hover:cursor-pointer"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const FlushedButton = ({ onClick, children }) => {
  return (
    <div
      className="text-grey-700 hover:bg-grey-50 rounded-md py-1 px-2 text-sm hover:cursor-pointer"
      onClick={onClick}
    >
      {children}
    </div>
  );
};
