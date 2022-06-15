import React from "react";

const SmallButton = ({ onClick, children }) => {
  return (
    <div
      className="text-gray-600 bg-gray-50 rounded-md py-1 px-2 text-sm hover:bg-gray-100 hover:cursor-pointer"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default SmallButton;
