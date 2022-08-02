import React from "react";

export const Card = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-white border-gray-100 rounded border p-6">
      {children}
    </div>
  );
};

const Header = ({ children }: { children: React.ReactNode }) => {
  return <h1 className="text-gray-700 text-lg">{children}</h1>;
};

Card.Header = Header;
