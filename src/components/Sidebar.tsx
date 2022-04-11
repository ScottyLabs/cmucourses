import React from "react";

const Sidebar = ({ children }) => {
  return (
    <div className="inset-0 p-6 bg-white dark:bg-grey-900 text-grey-700 dark:text-grey-100 z-20 md:absolute divide-y drop-shadow-md">
      {children}
    </div>
  );
};

export default Sidebar;