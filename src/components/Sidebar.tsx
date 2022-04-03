import React from "react";

const Sidebar = ({ children }) => {
  return (
    <div className="inset-0 p-6 bg-zinc-100 text-zinc-700 drop-shadow-lg md:absolute divide-y">
      {children}
    </div>
  );
};

export default Sidebar;