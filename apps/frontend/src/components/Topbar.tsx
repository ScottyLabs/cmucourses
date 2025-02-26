import React from "react";

const Topbar = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-white text-gray-700 border-gray-100 sticky top-0 border-b px-8 py-6">
      {children}
    </div>
  );
};

export default Topbar;
