import React from "react";

const SmallButton = ({ onClick, children }) => {
  return (
    <div
      className="rounded-md bg-gray-50 py-1 px-2 text-sm text-gray-600 hover:cursor-pointer hover:bg-gray-100   "
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default SmallButton;
