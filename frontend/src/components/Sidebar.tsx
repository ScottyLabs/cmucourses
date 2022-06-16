import React from "react";

const Sidebar = ({ children }) => {
  return (
    <div className="bg-white text-gray-700 inset-0 z-20 space-y-6 p-6 drop-shadow-md md:absolute">
      {children}
    </div>
  );
};

export default Sidebar;
