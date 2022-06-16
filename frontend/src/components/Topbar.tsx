import React from "react";

const Topbar = ({ children }) => {
  return (
    <div className="bg-white text-gray-700 sticky top-0 z-10 p-8 drop-shadow-lg">
      {children}
    </div>
  );
};

export default Topbar;
