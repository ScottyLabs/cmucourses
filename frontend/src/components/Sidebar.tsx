import React from "react";

const Sidebar = ({ children }) => {
  return (
    <div className="inset-0 z-20 bg-white p-6 text-grey-700 drop-shadow-md dark:bg-grey-900 dark:text-grey-100 md:absolute">
      {children}
    </div>
  );
};

export default Sidebar;
